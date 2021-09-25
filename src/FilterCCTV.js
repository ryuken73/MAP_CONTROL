import React from 'react';
import Box from '@material-ui/core/Box';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContentText from '@material-ui/core/DialogContentText';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import styled from 'styled-components';
import Column from './Column';
import { DragDropContext } from 'react-beautiful-dnd';
import {moveTo, remove, add} from './lib/arrayUtil';

const scroll = 'paper';
const FilterCCTV = props => {
    const {
        filterOpen=false,
        cctvs=[],
        optionTitle="Filter CCTVs",
        setFilterOpen=()=>{},
        columnData={},
        columnOrder=[],
        setColumnData=()=>{},
        groupByArea=true,
        setGroupByArea=()=>{}
        // cctvsInDropOn=[]
    } = props;

    const onCloseFilterDialog = () => {
        setFilterOpen(false);
    }

    const onDragEnd = React.useCallback(result => {
        const {destination, source} = result;
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

    const handleChange = React.useCallback(event => {
        setGroupByArea(event.target.checked);
    },[groupByArea])

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Dialog
                open={filterOpen}
                onClose={onCloseFilterDialog}
                scroll={scroll}
                aria-labelledby="scroll-dialog-title"
                aria-describedby="scroll-dialog-description"
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle id="scroll-dialog-title">
                    <Box display="flex" flexDirection="row">
                        {optionTitle}
                        <Box style={{marginLeft:'auto'}}>
                            <FormControlLabel control={<Checkbox color="primary" size="small" checked={groupByArea} onChange={handleChange} />} label="지역별로 묶기" />
                        </Box>
                    </Box>
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
                                    columnData={columnData}
                                    cctvs={cctvs}
                                    setColumnData={setColumnData}
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