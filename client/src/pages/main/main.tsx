import styles from './main.module.scss';
import Map from '../../map'
import Navbar from '../../components/navbar';
import Reports from '../../components/reports';
import Tags from '../../components/tags';


const Main = () => {

    return (
        <div className={styles.main}>
            <div className={styles.map} id='map'>
                <Map />
            </div>
            <div className={styles.tags}> <Tags /> </div>
            <div className={styles.reports}> <Reports /> </div>
            {/* <div className={styles.navbar}> <Navbar /> </div> */}
        </div>
    )
};

export default Main;