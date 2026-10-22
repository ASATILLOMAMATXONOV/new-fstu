import { useMemo } from 'react';
import { Editor } from '@tinymce/tinymce-react';

// TinyMCE core
import 'tinymce/tinymce';
import 'tinymce/models/dom';
import 'tinymce/icons/default';
import 'tinymce/themes/silver';

// TinyMCE skins
import 'tinymce/skins/ui/oxide/skin';
import 'tinymce/skins/ui/oxide/content';
import 'tinymce/skins/ui/oxide/content.inline';

// TinyMCE plugins
import 'tinymce/plugins/advlist';
import 'tinymce/plugins/anchor';
import 'tinymce/plugins/autolink';
import 'tinymce/plugins/autoresize';
import 'tinymce/plugins/charmap';
import 'tinymce/plugins/code';
import 'tinymce/plugins/codesample';
import 'tinymce/plugins/directionality';
import 'tinymce/plugins/emoticons';
import 'tinymce/plugins/fullscreen';
import 'tinymce/plugins/help';
import 'tinymce/plugins/image';
import 'tinymce/plugins/insertdatetime';
import 'tinymce/plugins/link';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/media';
import 'tinymce/plugins/nonbreaking';
import 'tinymce/plugins/pagebreak';
import 'tinymce/plugins/preview';
import 'tinymce/plugins/quickbars';
import 'tinymce/plugins/searchreplace';
import 'tinymce/plugins/table';
import 'tinymce/plugins/visualblocks';
import 'tinymce/plugins/visualchars';
import 'tinymce/plugins/wordcount';
import 'tinymce/plugins/emoticons/js/emojis';
import 'tinymce/plugins/help/js/i18n/keynav/en';

// material-ui
import Box from '@mui/material/Box';
import GlobalStyles from '@mui/material/GlobalStyles';
import Typography from '@mui/material/Typography';
import { fileToDataUrl } from '../../utils/file';

const INLINE_IMAGE_MAX_BYTES = 2 * 1024 * 1024;
const INLINE_FILE_ACCEPT =
  '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.txt,.csv,.rtf,.odt,.ods,.odp';

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeHtmlAttribute(value) {
  return escapeHtml(value);
}

function formatBytes(bytes = 0) {
  const size = Number(bytes || 0);

  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.round(size / 1024)} KB`;
}

function pickLocalFile(accept = '') {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.style.display = 'none';

    const cleanup = () => {
      if (input.parentNode) {
        input.parentNode.removeChild(input);
      }
    };

    input.addEventListener(
      'change',
      () => {
        resolve(input.files?.[0] ?? null);
        cleanup();
      },
      { once: true }
    );

    document.body.appendChild(input);
    input.click();
  });
}

function validateLocalFile(file, maxBytes, label) {
  if (!file) {
    return;
  }

  if (file.size > maxBytes) {
    throw new Error(`${label} ${formatBytes(maxBytes)} dan katta bo‘lmasligi kerak.`);
  }
}

function showUploadError(error) {
  const message = error instanceof Error ? error.message : 'Yuklashda xatolik yuz berdi.';

  if (typeof window !== 'undefined' && window.tinymce?.activeEditor?.notificationManager) {
    window.tinymce.activeEditor.notificationManager.open({
      text: message,
      type: 'error'
    });
    return;
  }

  if (typeof window !== 'undefined') {
    window.alert(message);
  }
}

function buildInlineFileLink(file, url, fallbackText = '') {
  const linkText = String(fallbackText || file?.name || 'Fayl').trim() || 'Fayl';

  return `<a class="content-file-link" data-file-name="${escapeHtmlAttribute(file?.name || linkText)}" href="${url}" download="${escapeHtmlAttribute(file?.name || linkText)}" target="_blank" rel="noreferrer" title="${escapeHtmlAttribute(file?.name || linkText)}">${escapeHtml(linkText)}</a>`;
}

async function insertLocalImage(editor) {
  const file = await pickLocalFile('image/*');

  if (!file) {
    return;
  }

  validateLocalFile(file, INLINE_IMAGE_MAX_BYTES, 'Rasm');

  const src = await fileToDataUrl(file);
  editor.insertContent(`<img src="${src}" alt="${escapeHtmlAttribute(file.name)}" />`);
}

async function insertLocalFile(editor) {
  const file = await pickLocalFile(INLINE_FILE_ACCEPT);

  if (!file) {
    return;
  }

  const src = await fileToDataUrl(file);
  const selectedText = editor.selection.getContent({ format: 'text' }).trim();

  editor.insertContent(buildInlineFileLink(file, src, selectedText));
}

export default function TinyMceField({ label, value, onChange, disabled = false, height = 420 }) {
  const editorInit = useMemo(
    () => ({
      language: 'en',
      height,
      menubar: 'edit view insert format tools table help',
      resize: true,
      autoresize_bottom_margin: 16,
      promotion: false,
      branding: false,
      image_title: true,
      automatic_uploads: true,
      allow_html_data_urls: true,
      extended_valid_elements:
        'a[href|target|rel|title|class|download],img[src|alt|title|width|height|style|loading]',
      toolbar_mode: 'wrap',
      toolbar_sticky: false,
      toolbar_sticky_offset: 0,
      file_picker_types: 'image file',
      images_file_types: 'jpg,jpeg,png,gif,webp,svg',
      emoticons_database: 'emojis',
      plugins: [
        'autoresize',
        'preview',
        'searchreplace',
        'autolink',
        'directionality',
        'visualblocks',
        'visualchars',
        'fullscreen',
        'image',
        'link',
        'media',
        'table',
        'charmap',
        'pagebreak',
        'nonbreaking',
        'anchor',
        'insertdatetime',
        'advlist',
        'lists',
        'emoticons',
        'wordcount',
        'help',
        'code',
        'codesample',
        'quickbars'
      ],
      toolbar:
        'undo redo | cut copy paste pastetext | searchreplace visualblocks code | ' +
        'styles blocks fontfamily fontsize | ' +
        'bold italic underline strikethrough subscript superscript removeformat | ' +
        'forecolor backcolor | alignleft aligncenter alignright alignjustify | ' +
        'bullist numlist outdent indent blockquote | ' +
        'link localfile localimage media table charmap emoticons hr pagebreak nonbreaking anchor insertdatetime | ' +
        'ltr rtl | fullscreen preview help',
      quickbars_selection_toolbar:
        'bold italic underline | blocks | forecolor backcolor | bullist numlist blockquote | link localfile localimage',
      quickbars_insert_toolbar: 'localfile localimage table hr',
      style_formats: [
        { title: 'Paragraph', block: 'p' },
        { title: 'Heading 2', block: 'h2' },
        { title: 'Heading 3', block: 'h3' },
        { title: 'Heading 4', block: 'h4' },
        { title: 'Blockquote', block: 'blockquote' },
        { title: 'Code Block', block: 'pre' }
      ],
      font_family_formats:
        'Arial=arial,helvetica,sans-serif; ' +
        'Verdana=verdana,geneva,sans-serif; ' +
        'Tahoma=tahoma,arial,helvetica,sans-serif; ' +
        'Times New Roman=times new roman,times,serif; ' +
        'Georgia=georgia,palatino,serif; ' +
        'Courier New=courier new,courier,monospace',
      font_size_formats: '12px 14px 16px 18px 20px 24px 28px 32px 36px',
      content_style:
        'body { font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.7; margin: 16px; }',
      placeholder: `${label} uchun kontent kiriting...`,
      file_picker_callback: async (callback, _value, meta) => {
        try {
          if (meta.filetype === 'file') {
            const file = await pickLocalFile(INLINE_FILE_ACCEPT);

            if (!file) {
              return;
            }

            const src = await fileToDataUrl(file);

            callback(src, {
              text: file.name,
              title: file.name
            });
            return;
          }

          const file = await pickLocalFile('image/*');

          if (!file) {
            return;
          }

          validateLocalFile(file, INLINE_IMAGE_MAX_BYTES, 'Rasm');
          const src = await fileToDataUrl(file);

          callback(src, {
            alt: file.name,
            title: file.name
          });
        } catch (error) {
          showUploadError(error);
        }
      },
      images_upload_handler: async (blobInfo) => `data:${blobInfo.blob().type};base64,${blobInfo.base64()}`,
      setup: (editor) => {
        editor.ui.registry.addIcon(
          'localfileicon',
          '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zm0 2.5L16.5 7H14zM8.75 13.25h6.5a.75.75 0 0 1 0 1.5h-6.5a.75.75 0 0 1 0-1.5zm0 3.5h6.5a.75.75 0 0 1 0 1.5h-6.5a.75.75 0 0 1 0-1.5zm0-7h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1 0-1.5z"/></svg>'
        );

        editor.ui.registry.addButton('localimage', {
          icon: 'image',
          tooltip: 'Rasm yuklash',
          onAction: async () => {
            try {
              await insertLocalImage(editor);
            } catch (error) {
              showUploadError(error);
            }
          }
        });

        editor.ui.registry.addButton('localfile', {
          icon: 'localfileicon',
          tooltip: 'Fayl yuklash',
          onAction: async () => {
            try {
              await insertLocalFile(editor);
            } catch (error) {
              showUploadError(error);
            }
          }
        });
      }
    }),
    [height, label]
  );

  return (
    <>
      <GlobalStyles
        styles={{
          '.tox-tinymce--toolbar-sticky-on .tox-editor-header': {
            position: 'static !important',
            top: 'auto !important',
            left: 'auto !important',
            right: 'auto !important',
            width: 'auto !important',
            zIndex: '1 !important'
          },
          '.tox .tox-editor-header': {
            position: 'static !important',
            top: 'auto !important',
            zIndex: '1 !important'
          },
          '.tox .tox-toolbar-overlord': {
            position: 'static !important'
          },
          '.tox .tox-toolbar, .tox .tox-toolbar__primary': {
            flexWrap: 'wrap !important'
          },
          '.tox-tinymce-aux': {
            zIndex: '1300 !important'
          }
        }}
      />

      <Box>
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
          {label}
        </Typography>

        <Box
          sx={{
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '6px',
            bgcolor: 'background.paper',
            '& .tox-tinymce': {
              border: 'none',
              position: 'relative !important'
            },
            '& .tox-editor-container': {
              position: 'relative !important'
            },
            '& .tox-editor-header': {
              position: 'static !important',
              top: 'auto !important',
              zIndex: '1 !important'
            },
            '& .tox-toolbar-overlord': {
              position: 'static !important'
            }
          }}
        >
          <Editor
            licenseKey="gpl"
            disabled={disabled}
            value={value}
            onEditorChange={onChange}
            init={editorInit}
          />
        </Box>
      </Box>
    </>
  );
}
