
import styles from './tags.module.scss';
import sharedStyles from '../components.module.scss';

import { FixedSizeList, ListChildComponentProps } from 'react-window';
import AutoSizer, { Size } from 'react-virtualized-auto-sizer';
import { useContext, useState } from "react";
import DataContext from '../../context/data';
import { reportsToGeoJSON } from '../../data';
import ReactIcon from '../../icon';
import { formatTime } from '../../utils';
import { TagDialog, TagEditDialog } from '../dialog/Dialog';
import { login } from '../../network/auth';
import { downloadReports } from '../../network/keys';
import { Tag } from '../../@types';
import { FaInfoCircle, FaPlus, FaSignInAlt, FaSync } from '../icons/icons';

const Tags = () => {
    const context = useContext(DataContext);
    if (!context) return null;

    const tags = Array.from(context?.tags.values());

    const [selectedTagId, setSelectedTagId] = useState<string>();
    const [newTagDialogOpen, setNewTagDialogOpen] = useState(false);

    return (
        <>
            { /* I don't like the use of casting like this, but its fine in this case */ }
            { selectedTagId && <TagDialog tag={context.tags.get(selectedTagId) as Tag} onClose={ () => setSelectedTagId(undefined) } /> }
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                        <span>Tags</span>
                    </div>
                    <div>
                        <FaSync className={sharedStyles.listActionButton} onClick={() => downloadReports().then(() => context.refreshData())} />
                        <FaSignInAlt className={sharedStyles.listActionButton} onClick={() => login() } />
                        <FaPlus className={sharedStyles.listActionButton} onClick={() => setNewTagDialogOpen(true) } />
                    </div>
                </div>
                <div style={{ flexGrow: 1 }}>
                    <AutoSizer>
                        {({ height, width }: Size) => (
                            <FixedSizeList
                                className={styles.reports}
                                height={height}
                                width={width}
                                itemSize={75}
                                itemCount={(context.tags.size)}
                                overscanCount={5}>
                                {({ index, style }: ListChildComponentProps) => {
                                    const tag = tags[index];
                                    const latestReport = context.reports.get(tag.id)?.sort((a, b) => b.timestamp - a.timestamp)[0];
                                    if (!tag) return null;

                                    return (
                                        <div style={style}>
                                            <div className={sharedStyles.listItem} key={index} onClick={() => {
                                                if (!latestReport) return;
                                                context.setSelectedReport(reportsToGeoJSON(tag, [latestReport])[0]);
                                            }}>
                                                <div className={sharedStyles.icon} style={{ color: tag.color, opacity: context.disabledTags.has(tag.id) ? 0.2 : 1 }} onClick={(e) => {
                                                    e.stopPropagation();
                                                    context.toggleTag(tag.id);
                                                }}>
                                                    <ReactIcon icon={tag.icon} />
                                                </div>
                                                <div className={sharedStyles.name}>
                                                    <span>{tag.name}</span>
                                                </div>
                                                <div className={sharedStyles.details}>
                                                    {latestReport ? formatTime(latestReport.timestamp) : 'No reports in timeframe'}
                                                </div>
                                                <div className={sharedStyles.actions}>
                                                    <FaSync className={sharedStyles.btn} onClick={((e) => {
                                                        e.stopPropagation();
                                                        downloadReports(tag.id, `Fetching reports for tag ${tag.name}`).then(() => context.refreshData())
                                                    })} />
                                                    <FaInfoCircle className={sharedStyles.btn} onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedTagId(tag.id);
                                                    }} />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }}
                            </FixedSizeList>
                        )}
                    </AutoSizer>
                </div>
            </div>


            { newTagDialogOpen && <TagEditDialog onClose={() => setNewTagDialogOpen(false)} /> }
        </>
    )

};


export default Tags;