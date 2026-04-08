import { h, defineComponent, ref, onMounted, onBeforeUnmount } from 'vue';
import Editorn from '../../index.js';

export const EditornVue = defineComponent({
  name: 'EditornVue',
  props: {
    data: {
      type: Object,
      default: () => ({ blocks: [] })
    },
    config: {
      type: Object,
      default: () => ({})
    },
    plugins: {
      type: Array,
      default: () => []
    }
  },
  emits: ['change'],
  setup(props, { emit }) {
    const containerRef = ref(null);
    let editorInstance = null;

    onMounted(() => {
      if (containerRef.value) {
        editorInstance = new Editorn({
          el: containerRef.value,
          data: props.data,
          onChange: (newData) => {
            emit('change', newData);
          },
          ...props.config
        });

        if (props.plugins) {
           props.plugins.forEach(p => {
               editorInstance.pluginManager.register(p.name, p.class, p.config);
           });
        }
      }
    });

    onBeforeUnmount(() => {
      if (editorInstance) {
        editorInstance.destroy();
        editorInstance = null;
      }
    });

    return () => h('div', { ref: containerRef });
  }
});

export default EditornVue;
