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

const CollabEditor = ({ collabId, user, providerUrl }) => {
  const [provider, setProvider] = useState(null);

  // Initialize Yjs Document and Provider
  const ydoc = new Y.Doc();

  useEffect(() => {
    const hocusProvider = new HocuspocusProvider({
      url: providerUrl,
      name: collabId,
      document: ydoc,
      token: localStorage.getItem('token'), // Use system token for auth
    });

    setProvider(hocusProvider);

    return () => {
      hocusProvider.destroy();
    };
  }, [collabId, providerUrl]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false, // Collaboration handled history itself
      }),
      Collaboration.configure({
        document: ydoc,
      }),
      CollaborationCursor.configure({
        provider: provider,
        user: {
          name: user.fullName || user.email,
          color: '#' + Math.floor(Math.random() * 16777215).toString(16), // Random color for cursor
        },
      }),
    ],
  }, [provider]);

  if (!editor || !provider) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  const MenuBar = () => {
    if (!editor) return null;

    return (
      <Paper elevation={0} className="editor-toolbar">
        <Box className="toolbar-group">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'is-active' : ''}
          >
            <Bold size={18} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'is-active' : ''}
          >
            <Italic size={18} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={editor.isActive('code') ? 'is-active' : ''}
          >
            <Code size={18} />
          </IconButton>
        </Box>

        <Box className="toolbar-group">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
          >
            <Heading1 size={18} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
          >
            <Heading2 size={18} />
          </IconButton>
        </Box>

        <Box className="toolbar-group">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'is-active' : ''}
          >
            <List size={18} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? 'is-active' : ''}
          >
            <ListOrdered size={18} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={editor.isActive('blockquote') ? 'is-active' : ''}
          >
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

  return (
    <Box className="collab-editor-container">
      <MenuBar />
      <Paper elevation={0} className="editor-content-wrapper">
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

export default CollabEditor;
