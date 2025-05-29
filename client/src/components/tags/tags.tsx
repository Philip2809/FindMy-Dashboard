
import styles from './tags.module.scss';
import sharedStyles from '../components.module.scss';

import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import AutoSizer, { Size } from 'react-virtualized-auto-sizer';
import { useContext, useRef, useState } from "react";
import ListItemAvatar from '@mui/material/ListItemAvatar';
import { Avatar, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Stack } from '@mui/material';
import DataContext from '../../context/data';
import { ReportPoint, reportsToGeoJSON } from '../../data';
import ReactIcon from '../../icon';
import { formatTime } from '../../utils';
import { getMacAddress } from '../../utils/key-utils';
import { FaInfoCircle, FaPlus, FaSync } from 'react-icons/fa';
import { fetchReports } from '../../utils/http/keys';
const Conf_Colors: { [key: number]: string } = {
    1: 'red',
    2: 'yellow',
    3: 'lightgreen'
};

const Tags = () => {
    const context = useContext(DataContext);
    if (!context) return null;

    // const [selectedReport, setSelectedReport] = useState<ReportPoint>();

    // const handleCloseDetailsDialog = () => {
    //     setSelectedReport(undefined);
    // };

    // const tagId = selectedReport?.properties?.tagId;
    // const tag = tagId ? context?.tags?.get(tagId) : undefined;
    // const selectedReportKey = tag ? tag.keys.find(key => key.hashed_public_key === selectedReport?.properties.hashed_public_key) : undefined;

    const disabledTags = new Set<number>();

    const tags = Array.from(context?.tags.values());
    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                    <span>Tags</span>
                </div>
                <div>
                    <FaPlus />
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
                                            <div className={sharedStyles.icon} style={{ color: tag.color }} onClick={() => {
                                                if (disabledTags.has(tag.id)) disabledTags.delete(tag.id);
                                                else disabledTags.add(tag.id);

                                                console.log(disabledTags);
                                            }}>
                                                <ReactIcon icon={tag.icon} />
                                            </div>
                                            <div className={sharedStyles.name}>
                                                {tag.name}
                                            </div>
                                            <div className={sharedStyles.details}>
                                                {latestReport ? formatTime(latestReport.timestamp) : 'No reports in view'}
                                            </div>
                                            <div className={sharedStyles.actions}>
                                                <FaSync className={sharedStyles.btn} onClick={((e) => {
                                                    e.stopPropagation();
                                                    fetchReports(tag.id);
                                                })} />
                                                <FaInfoCircle className={sharedStyles.btn} onClick={() => {
                                                    console.log('Tag Info:', tag);
                                                }} />
                                            </div>
                                        </div>
                                    </div>
                                );

                                return (
                                    <ListItem style={style} key={index} alignItems="flex-start">
                                        <ListItemButton
                                            onClick={() => setSelectedReport(report)}
                                            className={styles.row}>
                                            <ListItemAvatar>
                                                <Avatar sx={{ backgroundColor: tag.color }}>
                                                    <ReactIcon icon={tag.icon} />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                sx={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
                                                primary={tag.name}
                                                secondary={formatTime(report.properties.timestamp)} />
                                            <Stack direction="row" spacing={-1}>
                                                <Chip
                                                    label={`${report.properties.horizontal_accuracy}m`}
                                                    style={{ backgroundColor: Conf_Colors[report.properties.confidence], color: 'black' }}
                                                    variant="outlined" size="small" />
                                            </Stack>
                                        </ListItemButton>
                                    </ListItem>

                                );
                            }}
                        </FixedSizeList>

                    )}
                </AutoSizer>
            </div>
        </div>
    )

};


export default Tags;