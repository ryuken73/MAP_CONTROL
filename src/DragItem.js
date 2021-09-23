import React from 'react'
import Box from '@material-ui/core/Box';
import styled from 'styled-components';
import { Draggable } from 'react-beautiful-dnd';

const Container = styled.div`
    border: 1px solid;
    margin: 3px;
    padding: 3px;
    background-color: ${props => (props.isDragging ? 'maroon' : 'grey')};
    color: white;
    border-radius: 3px;
`
const DragItem = props => {
    const {cctv, index} = props;
    return (
        <Draggable key={cctv.title} draggableId={cctv.title} index={index}>
            {(provided, snapshot) => (
                <Container
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    ref={provided.innerRef}
                    isDragging={snapshot.isDragging}
                >
                    {cctv.title}
                </Container>
            )}
        </Draggable>
    )
}

export default React.memo(DragItem);