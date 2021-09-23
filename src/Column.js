import React from 'react';
import styled from 'styled-components';
import { Droppable } from 'react-beautiful-dnd';
import DragItem from './DragItem';

const Container = styled.div`
    height: 500px;
    width: 40%;
    border: 1px solid;
    overflow: auto; 
    border-radius: 3px;
    display: flex;
    flex-direction: column;
`
const Title = styled.h5`
  padding: 3px;
  margin: 3px
`;

const CCTVList = styled.div`
    padding: 8px;
    transition: background-color 0.2s ease;
    background-color: ${props => (props.isDraggingOver ? 'skyblue' : 'white')};
    flex-grow: 1;
    height: 100%    
`

const Column = props => {
    console.log('#### re-render Column:', props.column)
    const {title, column, cctvs} = props;
    const {cctvIds} = column;
    const [columnItems, setColumnItems] = React.useState([]);
    React.useEffect(() => {
        const cctvsInColumn = cctvIds.map(cctvId => cctvs.find(cctv => cctv.cctvId === cctvId))
        setColumnItems(cctvsInColumn);
    },[cctvIds, cctvs])
    return (
        <Container>
            <Title>{title} [{columnItems.length}]</Title>
            <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                    <CCTVList
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        isDraggingOver={snapshot.isDraggingOver}
                    >
                        {columnItems.map((cctv, index) => (
                            <DragItem key={cctv.cctvId} cctv={cctv} index={index} />
                        ))}
                        {provided.placeholder}
                    </CCTVList>
                )}
            </Droppable>
        </Container>
    )
}


export default React.memo(Column)