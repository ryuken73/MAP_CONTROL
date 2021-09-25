import React from 'react'
import Slide from '@material-ui/core/Slide';

function SimpleSlide(props) {
    const {
        direction="right",
        show=true,
        timeout=300,
        transitionDelay=50
    } = props;

    return (
        <Slide 
            direction={direction}
            in={show}
            timeout={timeout}
            style={{transitionDelay: transitionDelay}}
            {...props}
        >
                {props.children}
        </Slide>
    )
}

export default React.memo(SimpleSlide)