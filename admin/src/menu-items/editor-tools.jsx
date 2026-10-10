import { EditOutlined } from '@ant-design/icons';

const icons = { EditOutlined };

const editorTools = {
  id: 'editor-tools',
  title: 'Kontent',
  type: 'group',
  children: [
    {
      id: 'tinymce-editor',
      title: 'TinyMCE editor',
      type: 'item',
      url: '/editor/tinymce',
      icon: icons.EditOutlined
    }
  ]
};

export default editorTools;
