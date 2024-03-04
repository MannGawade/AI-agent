import React, { useState } from 'react';
import Draggable from 'react-draggable';

function App() {
  const [blocks, setBlocks] = useState([]);
  const [inputText, setInputText] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);
  const [activeBlockId, setActiveBlockId] = useState(null);

  const addBlock = () => {
    if (inputText.trim() !== '') {
      const newBlock = {
        id: Date.now(),
        content: inputText,
        defaultPos: { x: 20, y: 20 * blocks.length },
      };
      setBlocks(prevBlocks => [...prevBlocks, newBlock]);
      setInputText('');
    }
  };

  const onDragStop = (e, data, id) => {
    let merged = false;
    const updatedBlocks = blocks.map(block => {
      if (block.id === id) {
        return { ...block, defaultPos: { x: data.x, y: data.y } };
      }
      return block;
    }).filter(block => {
      if (block.id !== id) {
        const dx = Math.abs(block.defaultPos.x - data.x);
        const dy = Math.abs(block.defaultPos.y - data.y);
        if (dx < 100 && dy < 100) {
          merged = true;
          block.content += ' ' + blocks.find(b => b.id === id).content; // Merge content
          return true;
        }
      }
      return !merged;
    });

    setBlocks(updatedBlocks);
    if (merged) {
      // Remove the dragged block that was merged
      setBlocks(blocks => blocks.filter(block => block.id !== id));
    }
  };

  const handleChatSubmit = async () => {
    const activeBlock = blocks.find(block => block.id === activeBlockId);
    const blockContent = activeBlock ? activeBlock.content : "General";
    // Include the current message in the chat history before sending
    const updatedChatHistory = [...chatHistory, { sender: 'You', text: chatInput }];
  
    try {
      const response = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blockContent, // Send the block content for context
          userMessage: chatInput, // The latest user message
          chatHistory: updatedChatHistory, // Send the updated chat history including the latest message
        }),
      });
      const data = await response.json();
      if (data.response) {
        // Update the chat history with the response from the server
        setChatHistory([...updatedChatHistory, { sender: 'Bot', text: data.response }]);
      } else if (data.error) {
        // Handle any errors
        console.error("Error:", data.error);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    }
    setChatInput(''); // Clear the input field
  };

  return (
    <div>
      <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Enter text for new block" />
      <button onClick={addBlock}>Add Block</button>
      {blocks.map((block) => (
        <Draggable key={block.id} defaultPosition={block.defaultPos} onStop={(e, data) => onDragStop(e, data, block.id)}>
          <div onDoubleClick={() => { setShowWelcome(true); setActiveBlockId(block.id); }} style={{ margin: '8px', padding: '8px', background: '#f0f0f0', cursor: 'move', width: '200px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
            {block.content}
          </div>
        </Draggable>
      ))}
      {showWelcome && (
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', padding: '20px', border: '1px solid black', backgroundColor: 'white', zIndex: 1000 }}>
          <p>Welcome Block Chat</p>
          {chatHistory.map((msg, index) => (
            <div key={index} style={{ textAlign: msg.sender === 'You' ? 'right' : 'left' }}>
              <strong>{msg.sender}:</strong> {msg.text}
            </div>
          ))}
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
            placeholder="Type your message here"
          />
        </div>
      )}
    </div>
  );
}

export default App;
