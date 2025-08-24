import React from 'react';

export default function SimpleTest() {
  return (
    <div style={{ 
      padding: '50px', 
      backgroundColor: 'red', 
      color: 'white', 
      fontSize: '24px',
      minHeight: '100vh'
    }}>
      <h1>🎯 React应用正常工作！</h1>
      <p>如果你能看到这个页面，说明React和路由都正常</p>
      <p>当前时间: {new Date().toLocaleString()}</p>
      <div>
        <button onClick={() => alert('点击正常工作!')}>测试按钮</button>
      </div>
    </div>
  );
}
