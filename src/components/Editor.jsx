// src/components/Editor.jsx
import React, { useEffect, useRef } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { defaultKeymap } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";

const Editor = ({ code, onChange }) => {
  const editorRef = useRef(null);
  const viewRef = useRef(null);

  useEffect(() => {
    if (!editorRef.current) return;

    const startState = EditorState.create({
      doc: code || "",
      extensions: [
        keymap.of(defaultKeymap),
        javascript(),
        oneDark,
        EditorView.lineWrapping,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const doc = update.state.doc.toString();
            onChange(doc); // Trigger parent change handler
          }
        }),
      ],
    });

    viewRef.current = new EditorView({
      state: startState,
      parent: editorRef.current,
    });

    return () => {
      viewRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    if (!viewRef.current) return;

    const current = viewRef.current.state.doc.toString();
    if (code !== current) {
      const transaction = viewRef.current.state.update({
        changes: { from: 0, to: current.length, insert: code },
      });
      viewRef.current.dispatch(transaction);
    }
  }, [code]);

  return <div ref={editorRef} className="h-[500px] w-full border rounded shadow bg-[#282c34]" />;
};

export default Editor;
