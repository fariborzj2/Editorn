import { defineComponent, h, onMounted, onBeforeUnmount, ref, PropType } from 'vue';
import { Editron } from '../../core/Editron';
import { EditronConfig, BlockData } from '../../types';
import { SlashMenu } from '../../plugins/SlashMenu';
import { InlineToolbar } from '../../plugins/InlineToolbar';
import { Autosave } from '../../plugins/Autosave';
import { Collaboration } from '../../plugins/Collaboration';
import { AIAssistant } from '../../plugins/AIAssistant';

export default defineComponent({
  name: 'EditronVue',
  props: {
    data: {
      type: Array as PropType<BlockData[]>,
      default: () => []
    },
    placeholder: String,
    theme: {
      type: String as PropType<'light' | 'dark'>,
      default: 'light'
    }
  },
  emits: ['ready', 'change'],
  setup(props, { emit, expose }) {
    const holder = ref<HTMLElement | null>(null);
    let editor: Editron | null = null;

    const save = async () => {
      if (editor) {
        return await editor.save();
      }
      return [];
    };

    expose({ save, editor });

    onMounted(() => {
      if (!holder.value) return;

      const config: EditronConfig = {
        holder: holder.value,
        data: props.data,
        placeholder: props.placeholder,
        theme: props.theme
      };

      editor = new Editron(config);

      // Register plugins
      editor.pluginManager.register(new SlashMenu());
      editor.pluginManager.register(new InlineToolbar());
      editor.pluginManager.register(new Autosave());
      editor.pluginManager.register(new Collaboration());
      editor.pluginManager.register(new AIAssistant());

      editor.init();

      editor.on('ready', () => {
        emit('ready', editor);
      });

      editor.on('change', () => {
        editor?.save().then(data => {
          emit('change', data);
        });
      });
    });

    onBeforeUnmount(() => {
      // editor?.destroy();
      editor = null;
    });

    return () => h('div', { ref: holder, class: 'editron-vue-wrapper' });
  }
});
