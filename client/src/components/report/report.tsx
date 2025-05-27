
import styles from './report.module.scss';

import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import AutoSizer, { Size } from 'react-virtualized-auto-sizer';
import { useContext, useState } from "react";
import ListItemAvatar from '@mui/material/ListItemAvatar';
import { Avatar, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Stack } from '@mui/material';
import DataContext from '../../context/data';
import { ReportPoint } from '../../data';
import ReactIcon from '../../icon';
import { formatTime } from '../../utils';
import { getMacAddress } from '../../utils/key-utils';
const Conf_Colors: { [key: number]: string } = {
    1: 'red',
    2: 'yellow',
    3: 'lightgreen'
};

const Report = () => {
    return (
        <AutoSizer>
            {({ height, width }: Size) => (
                <FixedSizeList
                    className={styles.reports}
                    height={height}
                    width={width}
                    itemSize={90}
                    itemCount={(context.clickedReports.length ? context.clickedReports.length : context.seeingReports.length)}
                    overscanCount={5}>
                    {({ index, style }: ListChildComponentProps) => {
                        const report = (context.clickedReports.length ? context.clickedReports : context.seeingReports)[index];
                        if (!report) return <div />;
                        // const tag = tags.find(tag => tag.hashed_key === report.properties.hashed_public_key);
                        const tag = context?.tags.get(report.properties.tagId);
                        if (!tag) return null;
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

                        )
                    }}
                </FixedSizeList>

            )}
        </AutoSizer>
    )

};


export default Report;