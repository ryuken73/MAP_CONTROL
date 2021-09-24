import React from 'react';
import Box from '@material-ui/core/Box';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import styled from 'styled-components';
import Column from './Column';
import { DragDropContext } from 'react-beautiful-dnd';
import {moveTo, remove, add} from './lib/arrayUtil';

const Container = styled.div`
    height: 500px;
    width: 40%;
    border: 1px solid;
    overflow: auto; 
    border-radius: 3px;
`
const INITIAL_COLUMN_DATA = {
    'dragFrom': {
        id: 'dragFrom',
        title: 'Drag From',
        cctvIds:[]
    },
    'dropOn': {
        id: 'dropOn',
        title: 'Drop Here',
        cctvIds:[]
    }
}

const INITIAL_COLUMN_ORDER = ['dragFrom', 'dropOn'];

const getDropOnCCTVs = () => [];
const getDragFromCCTVs = (cctvIds, cctvsIdDropOn) => {
    return cctvIds.filter(cctvId => !(cctvsIdDropOn.includes(cctvId)) )
};
const scroll = 'paper';
const FilterCCTV = props => {
    const {
        filterOpen=false,
        cctvListRef=[],
        optionTitle="Filter CCTVs",
        setFilterOpen=()=>{}
    } = props;

    const cctvs = cctvListRef.current;
    const cctvIds = cctvs.map(cctv => cctv.cctvId)
    const [columnData, setColumnData] = React.useState(INITIAL_COLUMN_DATA);
    const [columnOrder, setColumnOrder] = React.useState(INITIAL_COLUMN_ORDER);

    React.useEffect(() => {
        const cctvsInDropOn = getDropOnCCTVs();
        const cctvsInDragFrom = getDragFromCCTVs(cctvIds, cctvsInDropOn);
        setColumnData({
            'dragFrom': {
                ...columnData.dragFrom,
                cctvIds: cctvsInDragFrom
            },
            'dropOn': {
                ...columnData.dropOn,
                cctvIds: cctvsInDropOn
            }
        })
    },[cctvs])

    const onCloseFilterDialog = () => {
        setFilterOpen(false);
    }

    const onDragEnd = React.useCallback(result => {
        const {destination, source, draggableId} = result;
        const MOVE_OUTSIDE = !destination;
        const NOT_MOVED = !MOVE_OUTSIDE && destination.droppableId === source.droppableId && destination.index === source.index;
        if(MOVE_OUTSIDE || NOT_MOVED) return;

        const DROP_IN_SAME_COLUMN = source.droppableId ===  destination.droppableId;
        if(DROP_IN_SAME_COLUMN){
            // exchange cctvIds;
            const targetColumn = columnData[source.droppableId]
            const sourceIndex = source.index;
            const destinationIndex = destination.index;
            const newCCTVIds = moveTo(targetColumn.cctvIds).fromIndex(sourceIndex).toIndex(destinationIndex);
            const newTargetColumn = {
                ...targetColumn,
                cctvIds: newCCTVIds
            }
            setColumnData({
                ...columnData,
                [source.droppableId]:{
                    ...newTargetColumn
                }
            })
        }
        // console.log('###',result, source.droppableId, source.index, destination.droppableId, destination.index);
        const DROP_IN_OTHER_COLUMN = source.droppableId !==  destination.droppableId;
        if(DROP_IN_OTHER_COLUMN){
            const sourceColumn = columnData[source.droppableId];
            const targetColumn = columnData[destination.droppableId];
            const sourceIndex = source.index;
            const targetIndex = destination.index;
            const sourceCCTVId = sourceColumn.cctvIds[sourceIndex];
            const newSourceCCTVIds = remove(sourceColumn.cctvIds).fromIndex(sourceIndex);
            const newTargetCCTVIds = add(targetColumn.cctvIds).toIndex(targetIndex).value(sourceCCTVId);
            const newSourceColumn = {
                ...sourceColumn,
                cctvIds: newSourceCCTVIds
            }
            const newTargetColumn = {
                ...targetColumn,
                cctvIds: newTargetCCTVIds
            }
            setColumnData({
                ...columnData,
                [source.droppableId]:{
                    ...newSourceColumn
                },
                [destination.droppableId]:{
                    ...newTargetColumn
                }
            })
        }

    },[columnData])

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Dialog
                open={filterOpen}
                onClose={onCloseFilterDialog}
                scroll={scroll}
                aria-labelledby="scroll-dialog-title"
                aria-describedby="scroll-dialog-description"
                fullWidth
                maxWidth="md"
            >
                <DialogTitle id="scroll-dialog-title">
                    {optionTitle}
                </DialogTitle>
                {/* <DialogContent dividers={scroll === 'paper'}> */}
                    <DialogContentText
                        id="scroll-dialog-description"
                        tabIndex={-1}
                    >
                        <Box display="flex" justifyContent="space-around">
                            {columnOrder.map(column => (
                                <Column
                                    title={columnData[column].title}
                                    column={columnData[column]}
                                    cctvs={cctvs}
                                >
                                </Column>
                            ))}
                        </Box>
                    </DialogContentText>
                {/* </DialogContent> */}
            </Dialog>
        </DragDropContext>
    )
}

export default React.memo(FilterCCTV)