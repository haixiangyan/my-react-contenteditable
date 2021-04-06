import React, {useState} from 'react'
import ContentEditable, {ContentEditableEvent} from "./lib";

function App() {
  const [value, setValue] = useState('');

  const onChange = (e: ContentEditableEvent) => {
    console.log('change', e.target.value)
  }

  return (
    <div style={{ border: '1px solid black' }}>
      <ContentEditable value={value} onChange={onChange} />
    </div>
  );
}

export default App;
