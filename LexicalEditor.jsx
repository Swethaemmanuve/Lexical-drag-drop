import React, { useState } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $getNodeByKey, DecoratorNode, FORMAT_TEXT_COMMAND } from 'lexical';
import { ListNode } from "@lexical/list";
import { HeadingNode } from "@lexical/rich-text";
import { QuoteNode } from "@lexical/rich-text";
import { CodeNode } from "@lexical/code";
// ------------------ Draggable Text Node ------------------
const DraggableBlockNode = (function () {
  return class extends DecoratorNode {
    __content;
    __style;
    constructor(content = '', style = {}, key) {
      super(key);
      this.__content = content;
      this.__style = style;
    }
    static getType() {
      return 'draggable-block';
    }
    static clone(node) {
      return new DraggableBlockNode(node.__content, node.__style, node.__key);
    }
    createDOM() {
      const dom = document.createElement('div');
      dom.className = 'draggable-block-node';
      return dom;
    }
    updateDOM() {
      return false;
    }
    setContent(content) {
      const self = this.getWritable();
      self.__content = content;
    }
    setStyle(style) {
      const self = this.getWritable();
      self.__style = { ...self.__style, ...style };
    }
    getContent() {
      return this.__content;
    }
    getStyle() {
      return this.__style;
    }
    decorate() {
      return (
        <DraggableComponent
          nodeKey={this.__key}
          content={this.__content}
          style={this.__style}
        />
      );
    }
  };
})();
const $createDraggableBlockNode = (content, style = {}) => {
  return new DraggableBlockNode(content, style);
};

// Draggable Text Component
const DraggableComponent = ({ nodeKey, content, style }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [editor] = useLexicalComposerContext();
  const [position, setPosition] = useState({ x: style.left || 0, y: style.top || 0 });

  const handleDragStart = (e) => {
    e.dataTransfer.setData('application/x-draggable-block', nodeKey);
    e.dataTransfer.effectAllowed = 'move';
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    e.dataTransfer.setData('application/x-offset', JSON.stringify({ x: offsetX, y: offsetY }));
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const startLeft = position.x;
    const startTop = position.y;
    const handleMouseMove = (moveEvent) => {
      const newX = startLeft + (moveEvent.clientX - startX);
      const newY = startTop + (moveEvent.clientY - startY);
      setPosition({ x: newX, y: newY });
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if (node) {
          node.setStyle({ left: newX, top: newY });
        }
      });
    };
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      className={`draggable-block ${isDragging ? 'dragging' : ''}`}
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: 'move',
        ...style,
      }}
      draggable="true"
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onMouseDown={handleMouseDown}
    >
      {content || `Draggable Block ${nodeKey}`}
    </div>
  );
};

// ------------------ Draggable Image Node ------------------
const DraggableImageNode = (function () {
  return class extends DecoratorNode {
    __src;
    __style;
    constructor(src = '', style = {}, key) {
      super(key);
      this.__src = src;
      this.__style = style;
    }
    static getType() {
      return 'draggable-image';
    }
    static clone(node) {
      return new DraggableImageNode(node.__src, node.__style, node.__key);
    }
    createDOM() {
      const dom = document.createElement('div');
      dom.className = 'draggable-image-node';
      return dom;
    }
    updateDOM() {
      return false;
    }
    setSrc(src) {
      const self = this.getWritable();
      self.__src = src;
    }
    setStyle(style) {
      const self = this.getWritable();
      self.__style = { ...self.__style, ...style };
    }
    getSrc() {
      return this.__src;
    }
    getStyle() {
      return this.__style;
    }
    decorate() {
      return (
        <DraggableImageComponent
          nodeKey={this.__key}
          src={this.__src}
          style={this.__style}
        />
      );
    }
  };
})();
const $createDraggableImageNode = (src, style = {}) => {
  return new DraggableImageNode(src, style);
};

// Draggable Image Component
const DraggableImageComponent = ({ nodeKey, src, style }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [editor] = useLexicalComposerContext();
  const [position, setPosition] = useState({ x: style.left || 0, y: style.top || 0 });

  const handleDragStart = (e) => {
    e.dataTransfer.setData('application/x-draggable-image', nodeKey);
    e.dataTransfer.effectAllowed = 'move';
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    e.dataTransfer.setData('application/x-offset', JSON.stringify({ x: offsetX, y: offsetY }));
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const startLeft = position.x;
    const startTop = position.y;
    const handleMouseMove = (moveEvent) => {
      const newX = startLeft + (moveEvent.clientX - startX);
      const newY = startTop + (moveEvent.clientY - startY);
      setPosition({ x: newX, y: newY });
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if (node) {
          node.setStyle({ left: newX, top: newY });
        }
      });
    };
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      className={`draggable-image ${isDragging ? 'dragging' : ''}`}
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: 'move',
        width: '150px',
        height: '150px',
      }}
      draggable="true"
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onMouseDown={handleMouseDown}
    >
      <img
        src={src}
        alt="Draggable"
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
    </div>
  );
};

// ------------------ Drag Drop Plugin ------------------
const DragDropPlugin = () => {
  const [editor] = useLexicalComposerContext();
  React.useEffect(() => {
    const editorElement = document.querySelector('.editor-input');
    if (!editorElement) return;
    const handleDragOver = (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    };
    const handleDrop = (e) => {
      e.preventDefault();
      const editorRect = editorElement.getBoundingClientRect();
      let dropX = e.clientX - editorRect.left;
      let dropY = e.clientY - editorRect.top;
      try {
        const offsetData = e.dataTransfer.getData('application/x-offset');
        if (offsetData) {
          const { x, y } = JSON.parse(offsetData);
          dropX -= x;
          dropY -= y;
        }
      } catch (err) {
        console.error('Error parsing offset data', err);
      }
      const draggedTextKey = e.dataTransfer.getData('application/x-draggable-block');
      if (draggedTextKey) {
        editor.update(() => {
          const draggedNode = $getNodeByKey(draggedTextKey);
          if (draggedNode) {
            draggedNode.setStyle({ left: dropX, top: dropY });
          }
        });
        return;
      }
      const draggedImageData = e.dataTransfer.getData('application/x-draggable-image');
      if (draggedImageData) {
        if (draggedImageData.startsWith('data:')) {
          editor.update(() => {
            const node = $createDraggableImageNode(draggedImageData, { left: dropX, top: dropY });
            $getRoot().append(node);
          });
        } else {
          editor.update(() => {
            const draggedNode = $getNodeByKey(draggedImageData);
            if (draggedNode) {
              draggedNode.setStyle({ left: dropX, top: dropY });
            }
          });
        }
        return;
      }
      const content = e.dataTransfer.getData('text/plain');
      if (content) {
        editor.update(() => {
          const node = $createDraggableBlockNode(content, { left: dropX, top: dropY });
          $getRoot().append(node);
        });
      }
    };
    editorElement.addEventListener('dragover', handleDragOver);
    editorElement.addEventListener('drop', handleDrop);
    return () => {
      editorElement.removeEventListener('dragover', handleDragOver);
      editorElement.removeEventListener('drop', handleDrop);
    };
  }, [editor]);
  return null;
};

// ------------------ Formatting Toolbar ------------------
const Toolbar = () => {
  const [editor] = useLexicalComposerContext();
  const formatText = (formatType) => {
    // Dispatch inline formatting commands for bold, italic, underline
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, formatType);
  };
  const toggleHeading = (heading) => {
    editor.update(() => {
      // Placeholder: implement heading toggling logic.
      // For example, update the block type or wrap selection in a heading node.
      console.log(`Toggle heading: ${heading}`);
    });
  };
  return (
    <div className="toolbar">
      <button onClick={() => formatText('bold')}>B</button>
      <button onClick={() => formatText('italic')}>I</button>
      <button onClick={() => formatText('underline')}>Underline</button>
      <button onClick={() => toggleHeading('h1')}>H1</button>
      <button onClick={() => toggleHeading('h2')}>H2</button>
      <button onClick={() => toggleHeading('h3')}>H3</button>
    </div>
  );
};

// ------------------ Main Editor Component ------------------
const TextEditor = () => {
  const [inputValue, setInputValue] = useState('');
  const [storedValues, setStoredValues] = useState([]);
  const [storedImages, setStoredImages] = useState([]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleAddValue = () => {
    if (inputValue.trim() !== '') {
      setStoredValues([...storedValues, inputValue.trim()]);
      setInputValue('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAddValue();
    }
  };

  // Image file upload handler
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageDataUrl = event.target.result;
      setStoredImages((prev) => [...prev, imageDataUrl]);
    };
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  const initialConfig = {
    namespace: 'MyDragDropEditor',
    theme: {
      paragraph: 'editor-paragraph',
      text: {
        bold: 'editor-text-bold',
        italic: 'editor-text-italic',
        underline: 'editor-text-underline',
      },
    },
    nodes: [
      DraggableBlockNode, 
      DraggableImageNode,
      // Add these nodes which are used by the ToolbarPlugin
      ListNode,
      HeadingNode,
      QuoteNode,
      CodeNode
    ],
    onError: (error) => console.error(error),
  };
  return (
    <div className="editor-container">
      <div className="input-section">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a value"
          className="text-input"
        />
        <button onClick={handleAddValue} className="add-button">
          Add Text
        </button>
        <input type="file" accept="image/*" onChange={handleImageUpload} className="image-input" />
      </div>

      <div className="stored-values">
        <h3>Stored Values (Drag to Editor):</h3>
        <div className="values-container">
          {storedValues.map((value, index) => (
            <div
              key={`text-${index}`}
              className="draggable-item"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', value);
                e.dataTransfer.effectAllowed = 'move';
              }}
            >
              {value}
            </div>
          ))}
          {storedImages.map((imgSrc, index) => (
            <div
              key={`img-${index}`}
              className="draggable-item"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('application/x-draggable-image', imgSrc);
                e.dataTransfer.effectAllowed = 'move';
              }}
              style={{ width: '150px', height: '150px' }}
            >
              <img
                src={imgSrc}
                alt={`Uploaded ${index}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="editor-section">
        <h3>Editor (Drop Items Anywhere):</h3>
        <LexicalComposer initialConfig={initialConfig}>
          <div className="editor-inner">
            {/* Formatting toolbar */}
            <Toolbar />
            {/* Wrap the content editable area in a styled box */}
            <div className="editor-box">
              <RichTextPlugin
                contentEditable={
                <ContentEditable className="editor-input" />}
                placeholder={<div className="editor-placeholder">Create Document....</div>}
                ErrorBoundary={LexicalErrorBoundary}
              />
            </div>
            <HistoryPlugin />
            <AutoFocusPlugin />
            <DragDropPlugin />
          </div>
        </LexicalComposer>
      </div>
    </div>
  );
};

export default TextEditor;
