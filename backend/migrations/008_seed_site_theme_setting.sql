INSERT INTO site_settings (key, data, updated_at)
VALUES (
  'site-theme',
  '{
    "defaultTheme": "blue",
    "themes": [
      {
        "id": "blue",
        "label": "Ko''k",
        "primary": "#2563eb",
        "dark": "#1d4ed8",
        "deep": "#172554",
        "soft": "#dbeafe",
        "muted": "#eff6ff",
        "rgb": "37, 99, 235",
        "darkRgb": "29, 78, 216",
        "deepRgb": "23, 37, 84"
      },
      {
        "id": "teal",
        "label": "Moviy yashil",
        "primary": "#14b8a6",
        "dark": "#02645c",
        "deep": "#013f3a",
        "soft": "#dffaf6",
        "muted": "#f2fffd",
        "rgb": "20, 184, 166",
        "darkRgb": "2, 100, 92",
        "deepRgb": "1, 63, 58"
      },
      {
        "id": "green",
        "label": "Yashil",
        "primary": "#079447",
        "dark": "#047a3a",
        "deep": "#052e16",
        "soft": "#dcfce7",
        "muted": "#f0fdf4",
        "rgb": "7, 148, 71",
        "darkRgb": "4, 122, 58",
        "deepRgb": "5, 46, 22"
      }
    ]
  }'::jsonb,
  NOW()
)
ON CONFLICT (key)
DO UPDATE SET
  data = EXCLUDED.data,
  updated_at = NOW();
