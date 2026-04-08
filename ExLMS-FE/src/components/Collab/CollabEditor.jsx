import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import * as Y from 'yjs';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { Box, Paper, Typography, Avatar, Tooltip, IconButton, CircularProgress } from '@mui/material';
import {
  Bold, Italic, List, ListOrdered, Code,
  Heading1, Heading2, Quote, Undo, Redo
} from 'lucide-react';
import './CollabEditor.css';

const CollabEditor = ({ collabId, user, providerUrl, isReadOnly = false }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [provider, setProvider] = useState(null);

  // 1. Maintain a stable reference to Y.Doc
  const ydoc = React.useMemo(() => new Y.Doc(), [collabId]);

  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    console.log('[CollabEditor] Initializing with token:', token ? 'Exists' : 'MISSING');

    const hocusProvider = new HocuspocusProvider({
      url: providerUrl,
      name: collabId,
      document: ydoc,
      token: token,
      onConnect: () => setIsConnected(true),
      onDisconnect: () => setIsConnected(false),
    });

    hocusProvider.doc = ydoc;
    setProvider(hocusProvider);

    return () => {
      hocusProvider.destroy();
    };
  }, [collabId, providerUrl, ydoc]);

  if (!isConnected || !provider) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', p: 5 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Connecting to collaboration server...</Typography>
      </Box>
    );
  }

  return (
    <EditorInner 
      ydoc={ydoc} 
      provider={provider} 
      user={user} 
      isReadOnly={isReadOnly} 
    />
  );
};

// Internal component for stable editor initialization
const EditorInner = ({ ydoc, provider, user, isReadOnly }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false,
      }),
      Collaboration.configure({
        document: ydoc,
      }),
      CollaborationCursor.configure({
        provider: provider,
        user: {
          name: user.fullName || user.email,
          color: '#' + Math.floor(Math.random() * 16777215).toString(16),
        },
      }),
    ],
    editable: !isReadOnly,
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <Box className="collab-editor-container">
      <EditorToolbar editor={editor} isReadOnly={isReadOnly} />
      <Paper elevation={0} className={`editor-content-wrapper ${isReadOnly ? 'readonly-mode' : ''}`}>
        <EditorContent editor={editor} />
      </Paper>

      <Box className="editor-footer">
        <Typography variant="caption" color="text.secondary">
          {provider.status === 'connected' ? '● Live' : '○ Offline'}
        </Typography>
      </Box>
    </Box>
  );
};

const EditorToolbar = ({ editor, isReadOnly }) => {
  if (!editor || isReadOnly) return null;

  return (
    <Paper elevation={0} className="editor-toolbar">
      <Box className="toolbar-group">
        <IconButton size="small" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'is-active' : ''}>
          <Bold size={18} />
        </IconButton>
        <IconButton size="small" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'is-active' : ''}>
          <Italic size={18} />
        </IconButton>
        <IconButton size="small" onClick={() => editor.chain().focus().toggleCode().run()} className={editor.isActive('code') ? 'is-active' : ''}>
          <Code size={18} />
        </IconButton>
      </Box>

      <Box className="toolbar-group">
        <IconButton size="small" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}>
          <Heading1 size={18} />
        </IconButton>
        <IconButton size="small" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}>
          <Heading2 size={18} />
        </IconButton>
      </Box>

      <Box className="toolbar-group">
        <IconButton size="small" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'is-active' : ''}>
          <List size={18} />
        </IconButton>
        <IconButton size="small" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'is-active' : ''}>
          <ListOrdered size={18} />
        </IconButton>
        <IconButton size="small" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive('blockquote') ? 'is-active' : ''}>
          <Quote size={18} />
        </IconButton>
      </Box>

      <Box className="toolbar-group" sx={{ ml: 'auto' }}>
        <IconButton size="small" onClick={() => editor.chain().focus().undo().run()}>
          <Undo size={18} />
        </IconButton>
        <IconButton size="small" onClick={() => editor.chain().focus().redo().run()}>
          <Redo size={18} />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default CollabEditor;
