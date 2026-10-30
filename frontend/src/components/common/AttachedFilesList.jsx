import { MdDownload as DownloadRoundedIcon, MdInsertDriveFile as InsertDriveFileRoundedIcon } from 'react-icons/md';
import React from 'react';

import '../../assets/styles/AttachedFilesList.css';
import { useLanguage } from '../../context/LanguageContext';
import { getSiteMessages } from '../../locales/site';
import { getTranslatedField } from '../../utils/cms';
import { formatFileSize, getFileTypeLabel, normalizeAttachedFiles } from '../../utils/files';

function AttachedFilesList({ items = [] }) {
  const { currentLanguageCode } = useLanguage();
  const texts = React.useMemo(
    () => getSiteMessages(currentLanguageCode).pages.fileAttachments,
    [currentLanguageCode]
  );
  const files = React.useMemo(() => normalizeAttachedFiles(items), [items]);

  if (!files.length) {
    return null;
  }

  return (
    <section className="attached-files-wrap">
      <div className="attached-files-head">
        <span>{texts.eyebrow}</span>
        <h3>{texts.title}</h3>
      </div>

      <div className="attached-files-list">
        {files.map((item, index) => {
          const displayTitle =
            getTranslatedField(item, 'title', item.name || texts.defaultTitle) ||
            item.name ||
            texts.defaultTitle;
          const sizeLabel = formatFileSize(item.size);
          const typeLabel = getFileTypeLabel(item);

          return (
            <a
              key={item.id}
              href={item.href}
              className="attached-files-item"
              download={item.name || undefined}
              target="_blank"
              rel="noreferrer"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <div className="attached-files-icon">
                <InsertDriveFileRoundedIcon size={20} />
              </div>

              <div className="attached-files-copy">
                <strong>{displayTitle}</strong>

                <div className="attached-files-meta">
                  <span>
                    {texts.typeLabel}: {typeLabel}
                  </span>

                  {sizeLabel ? (
                    <span>
                      {texts.sizeLabel}: {sizeLabel}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="attached-files-action">
                <span>
                  {texts.action}
                  <DownloadRoundedIcon size="1em" />
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}

export default AttachedFilesList;
