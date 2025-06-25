import React from 'react';
import { Scrollbars } from 'react-custom-scrollbars-2';
import { useSelector } from 'react-redux';

const SmoothScrollbar = ({ children }) => {
  return (
    <Scrollbars
      autoHide
      autoHideTimeout={1000}
      autoHideDuration={200}
      className="custom-scrollbar"
      style={{ width: '100%', height: '100vh' }}
    >
      {children}
    </Scrollbars>
  );
};

export default SmoothScrollbar; 