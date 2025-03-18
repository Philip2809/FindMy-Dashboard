
import styles from './reports.module.scss';

import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import AutoSizer, { Size } from 'react-virtualized-auto-sizer';
import { useContext } from "react";
import ListItemAvatar from '@mui/material/ListItemAvatar';
import { Avatar, Chip, Stack } from '@mui/material';
import DataContext from '../../../../context/data';
import ReactIcon from '../../../../icon';
import { formatTime } from '../../../../utils';
const Conf_Colors: { [key: number]: string } = {
    1: 'red',
    2: 'yellow',
    3: 'lightgreen'
};

const Reports = () => {
    const context = useContext(DataContext);
    if (!context) return null;

    const tags = Array.from(context.tagsWithReports.keys() || []);


    return (
        <AutoSizer className={styles.height}>
            {({ height, width }: Size) => (
                <FixedSizeList
                    height={height}
                    width={width}
                    itemSize={90}
                    itemCount={(context.clickedReports.length ? context.clickedReports.length : context.seeingReports.length) + 1}
                    overscanCount={5}>
                    {({ index, style }: ListChildComponentProps) => {
                        const report = (context.clickedReports.length ? context.clickedReports : context.seeingReports)[index];
                        if (! report) return <div />;
                        // const tag = tags.find(tag => tag.hashed_key === report.properties.hashed_public_key);
                        const tag = tags.find(tag => tag.id === report.properties.tagId);
                        if (!tag) return null;
                        return (
                            <ListItem style={style} key={index} alignItems="flex-start">
                                <ListItemButton
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


export default Reports;