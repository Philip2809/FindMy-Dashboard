
import styles from './tags.module.scss';
import sharedStyles from '../components.module.scss';

import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import AutoSizer, { Size } from 'react-virtualized-auto-sizer';
import { useContext, useRef, useState } from "react";
import ListItemAvatar from '@mui/material/ListItemAvatar';
import { Avatar, Button, Chip, DialogActions, DialogContent, DialogTitle, Stack } from '@mui/material';
import DataContext from '../../context/data';
import { ReportPoint, reportsToGeoJSON } from '../../data';
import ReactIcon from '../../icon';
import { formatTime } from '../../utils';
import { getMacAddress } from '../../utils/key-utils';
import { FaInfoCircle, FaPlus, FaSync } from 'react-icons/fa';
import { Dialog, TagDialog, TagEditDialog } from '../dialog/Dialog';
import { Tag } from '../../@types';
import { TbAuth2Fa } from 'react-icons/tb';
import { login } from '../../network/auth';
import { downloadReports } from '../../network/keys';
const Conf_Colors: { [key: number]: string } = {
    1: 'red',
    2: 'yellow',
    3: 'lightgreen'
};

const Tags = () => {
    const context = useContext(DataContext);
    if (!context) return null;

    const tags = Array.from(context?.tags.values());

    const [selectedTagId, setSelectedTagId] = useState<string>();
    const [newTagDialogOpen, setNewTagDialogOpen] = useState(false);

    return (
        <>
            { selectedTagId && <TagDialog tag={context.tags.get(selectedTagId)} onClose={ () => setSelectedTagId(undefined) } /> }
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                        <span>Tags</span>
                    </div>
                    <div>
                        <TbAuth2Fa className={sharedStyles.listActionButton} onClick={() => login() } />
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
                                    // const reports = context.seeingReports.filter(report => report.properties.tagId === tag.id);
                                    // const latestReport = reports.length > 0 ? reports[0] : undefined;
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
                                                    <span className={styles.tagLabel}> {tag.label}</span>
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