import React, { useEffect, useRef } from 'react';
import Editorn from '../../index.js';

export const EditornReact = ({ data, onChange, plugins, tools, blocks, config = {} }) => {
  const containerRef = useRef(null);
  const editorInstance = useRef(null);

  useEffect(() => {
    if (!editorInstance.current && containerRef.current) {
      editorInstance.current = new Editorn({
        el: containerRef.current,
        data: data || { blocks: [] },
        onChange: (newData) => {
          if (onChange) {
            onChange(newData);
          }
        },
        ...config
      });

      // Register Plugins & Tools dynamically based on props
      if (plugins) {
        plugins.forEach(p => {
           editorInstance.current.pluginManager.register(p.name, p.class, p.config);
        });
      }
    }

    return () => {
      if (editorInstance.current) {
        editorInstance.current.destroy();
        editorInstance.current = null;
      }
    };
  }, []);

  return <div ref={containerRef}></div>;
};

export default EditornReact;
