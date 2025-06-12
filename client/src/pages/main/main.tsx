import styles from './main.module.scss';
import Map from '../../map'
import Reports from '../../components/reports';
import Tags from '../../components/tags';
import { useContext, useState } from 'react';
import DataContext from '../../context/data';


const Main = () => {
    const context = useContext(DataContext);
    if (!context) return null;

    const [displayReports, setDisplayReports] = useState(false);

    return (
        <div className={styles.main}>
            {displayReports && <div className={styles.reports}> <Reports /> </div>}
            <div className={styles.map} style={{ gridColumn: displayReports ? '2 / span 2' : '1 / span 3' }} id='map'>
                <Map setDisplayReports={setDisplayReports} />
            </div>
            <div className={styles.tags}> <Tags /> </div>
        </div>
    )
};

export default Main;