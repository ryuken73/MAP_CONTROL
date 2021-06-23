import React from 'react';
import Box from '@material-ui/core/Box';

function OverlayContent(props) {
    const {title} = props;
    return (
        <Box>
            {title}
        </Box>
    )
}

export default React.memo(OverlayContent)