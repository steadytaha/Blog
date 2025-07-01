import React, { forwardRef } from 'react';
import { Scrollbars } from 'react-custom-scrollbars-2';

const SmoothScrollbar = forwardRef(({ children, height = '100vh' }, ref) => {
  return (
    <Scrollbars
      ref={ref}
      autoHide
      autoHideTimeout={1000}
      autoHideDuration={200}
      className="custom-scrollbar"
      style={{ width: '100%', height }}
    >
      {children}
    </Scrollbars>
  );
});

export default SmoothScrollbar; 