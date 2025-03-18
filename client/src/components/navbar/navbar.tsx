import { useContext, useState } from "react";
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Bar from "./drawers/bar/";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import Badge from "@mui/material/Badge";
import { Typography } from "@mui/material";
import StyleIcon from '@mui/icons-material/Style';
import PlaceIcon from '@mui/icons-material/Place';
import Tags from "./drawers/tags";
import Reports from "./drawers/reports";
import DataContext from "../../context/data";

const drawers = [
    {
        text: "Tags",
        icon: <StyleIcon fontSize="large" />,
        content: <Tags />,
    },
    {
        text: "Reports",
        icon: <PlaceIcon fontSize="large" />,
        content: <Reports />,
        showBadge: true
    }
]

const Navbar = () => {
    const context = useContext(DataContext);
    if (!context) return null;

    const [selected, setSelected] = useState<typeof drawers[0]>();

    return (
        <>
            <SwipeableDrawer
                anchor={'bottom'}
                open={!!selected}
                disableSwipeToOpen={true}
                onOpen={() => { /* unused */ }}
                onClose={() => { setSelected(undefined) }}>

                {selected && (
                    <>
                        {selected.content}
                        <Bar label={selected.text} icon={selected.icon} close={() => setSelected(undefined)} />
                    </>
                )}
            </SwipeableDrawer>

            <BottomNavigation showLabels value={-1} sx={{ height: '100%' }} onChange={(_, index) => setSelected(drawers[index])}>
                {drawers.map((drawer, index) => (
                    <BottomNavigationAction
                        key={index}
                        label={<Typography>{drawer.text}</Typography>}
                        icon={drawer.showBadge ? <Badge badgeContent={context.seeingReports.length} max={Infinity} color="success"> {drawer.icon} </Badge> : drawer.icon} />
                ))}
            </BottomNavigation>
        </>
    )

};


export default Navbar;