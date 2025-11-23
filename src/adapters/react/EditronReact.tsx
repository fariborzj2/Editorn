import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Editron } from '../../core/Editron';
import { EditronConfig, BlockData } from '../../types';
import { SlashMenu } from '../../plugins/SlashMenu';
import { InlineToolbar } from '../../plugins/InlineToolbar';
import { Autosave } from '../../plugins/Autosave';
import { Collaboration } from '../../plugins/Collaboration';
import { AIAssistant } from '../../plugins/AIAssistant';

export interface EditronReactProps extends Omit<EditronConfig, 'holder'> {
  className?: string;
  onReady?: (editor: Editron) => void;
  onChange?: (data: BlockData[]) => void;
}

export interface EditronRef {
  save: () => Promise<BlockData[]>;
  getInstance: () => Editron | null;
}

export const EditronReact = forwardRef<EditronRef, EditronReactProps>((props, ref) => {
  const holderRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Editron | null>(null);

  useImperativeHandle(ref, () => ({
    save: async () => {
      if (editorRef.current) {
        return editorRef.current.save();
      }
      return [];
    },
    getInstance: () => editorRef.current
  }));

  useEffect(() => {
    if (!holderRef.current) return;

    const config: EditronConfig = {
      holder: holderRef.current,
      data: props.data,
      placeholder: props.placeholder,
      theme: props.theme
    };

    const editor = new Editron(config);

    // Register default plugins
    // In a real adapter, plugins might be prop-driven
    editor.pluginManager.register(new SlashMenu());
    editor.pluginManager.register(new InlineToolbar());
    editor.pluginManager.register(new Autosave()); // Warning: Autosave might conflict if multiple instances
    editor.pluginManager.register(new Collaboration());
    editor.pluginManager.register(new AIAssistant());

    editor.init();
    editorRef.current = editor;

    if (props.onReady) {
      editor.on('ready', () => props.onReady!(editor));
    }

    if (props.onChange) {
      editor.on('change', () => {
        editor.save().then(data => props.onChange!(data));
      });
    }

    return () => {
      // Cleanup logic if Editron had a destroy method
      // editor.destroy();
      editorRef.current = null;
      if (holderRef.current) {
          holderRef.current.innerHTML = '';
      }
    };
  }, []);

  return <div ref={holderRef} className={props.className} />;
});
