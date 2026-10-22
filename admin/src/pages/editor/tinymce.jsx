import { Box, FormHelperText, GlobalStyles, Typography } from '@mui/material';
import { Editor } from '@tinymce/tinymce-react';

export default function TinyMceField({
  label = '',
  value = '',
  onChange,
  disabled = false,
  height = 320,
  placeholder = '',
  helperText = ''
}) {
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

      <Box sx={{ width: '100%', position: 'relative' }}>
        {label && (
          <Typography sx={{ mb: 1, fontWeight: 700 }}>
            {label}
          </Typography>
        )}

        <Box
          sx={{
            width: '100%',
            height,
            minHeight: height,
            maxHeight: height,
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '6px',

            '& .tox': {
              width: '100% !important',
              height: `${height}px !important`,
              position: 'relative !important'
            },

            '& .tox-tinymce': {
              width: '100% !important',
              height: `${height}px !important`,
              minHeight: `${height}px !important`,
              maxHeight: `${height}px !important`,
              borderRadius: '6px !important',
              borderColor: '#dbe0e6 !important',
              position: 'relative !important',
              overflow: 'hidden !important'
            },

            '& .tox-editor-container': {
              position: 'relative !important',
              overflow: 'hidden !important'
            },

            '& .tox-editor-header': {
              position: 'static !important',
              top: 'auto !important',
              zIndex: '1 !important'
            },

            '& .tox-toolbar-overlord': {
              position: 'static !important'
            },

            '& .tox-toolbar, & .tox-toolbar__primary': {
              flexWrap: 'wrap !important'
            },

            '& .tox-statusbar': {
              display: 'none !important'
            }
          }}
        >
          <Editor
            value={value || ''}
            disabled={disabled}
            onEditorChange={(content) => {
              if (onChange) onChange(content);
            }}
            init={{
              height,

              inline: false,
              menubar: false,
              branding: false,
              promotion: false,
              resize: false,
              statusbar: false,

              toolbar_sticky: false,
              toolbar_sticky_offset: 0,
              toolbar_mode: 'wrap',

              placeholder,

              plugins: [
                'advlist',
                'autolink',
                'lists',
                'link',
                'image',
                'charmap',
                'preview',
                'anchor',
                'searchreplace',
                'visualblocks',
                'code',
                'fullscreen',
                'insertdatetime',
                'media',
                'table',
                'wordcount'
              ],

              toolbar:
                'undo redo | blocks | bold italic underline strikethrough | ' +
                'alignleft aligncenter alignright alignjustify | ' +
                'bullist numlist outdent indent | ' +
                'link image media table | removeformat | code fullscreen preview',

              content_style:
                'body { font-family: Inter, Arial, sans-serif; font-size: 14px; line-height: 1.7; color: #111827; padding: 12px; } ' +
                'img { max-width: 100%; height: auto; } ' +
                'table { width: 100%; border-collapse: collapse; } ' +
                'td, th { border: 1px solid #dbe0e6; padding: 8px; }'
            }}
          />
        </Box>

        {helperText && (
          <FormHelperText sx={{ mt: 0.75 }}>
            {helperText}
          </FormHelperText>
        )}
      </Box>
    </>
  );
}