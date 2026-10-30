import { MdArrowOutward as ArrowOutwardRoundedIcon, MdOutlineDescription as DescriptionOutlinedIcon } from 'react-icons/md';
import React from 'react';

import '../../assets/styles/LinkedInfoTable.css';
import { useLanguage } from '../../context/LanguageContext';
import { getSiteMessages } from '../../locales/site';
import { getTranslatedField } from '../../utils/cms';
import { normalizeLinkTableItems } from '../../utils/linkTable';
import AppLink from './AppLink';

function LinkedInfoTable({ items = [] }) {
  const { currentLanguageCode } = useLanguage();
  const texts = React.useMemo(
    () => getSiteMessages(currentLanguageCode).pages.linkedInfoTable,
    [currentLanguageCode]
  );
  const rows = React.useMemo(() => normalizeLinkTableItems(items), [items]);

  if (!rows.length) {
    return null;
  }

  return (
    <div className="linked-info-table-wrap">
      <div className="linked-info-table-head">
        <span>{texts.eyebrow}</span>
      </div>

      <div className="linked-info-table">
        {rows.map((item, index) => (
          <AppLink
            key={item.id}
            href={item.href}
            className="linked-info-table-row"
            style={{ animationDelay: `${index * 0.08}s` }}
          >
            <div className="linked-info-table-index">{index + 1}</div>

            <div className="linked-info-table-icon">
              <DescriptionOutlinedIcon size={20} />
            </div>

            <div className="linked-info-table-title">
              <strong>{getTranslatedField(item, 'title', item.href) || item.href}</strong>
              <span>{item.href}</span>
            </div>

            <div className="linked-info-table-action">
              <span className="linked-info-table-open">
                {texts.action}
                <ArrowOutwardRoundedIcon size="1em" />
              </span>
            </div>
          </AppLink>
        ))}
      </div>
    </div>
  );
}

export default LinkedInfoTable;
