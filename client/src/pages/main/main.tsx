import styles from './main.module.scss';
import dialogStyles from '../../components/dialog/Dialog.module.scss';
import Map from '../../map'
import Reports from '../../components/reports';
import Tags from '../../components/tags';
import { useContext, useEffect, useState } from 'react';
import DataContext from '../../context/data';
import { Dialog } from '../../components/dialog/Dialog';
import { select2FAMethod, submit2FACode } from '../../network/auth';
import { actionDispatcher, ActionPayload } from '../../utils/dispatchers/action.dispatcher';


function getDialog(key: string, action: ActionPayload, onClose: () => void) {
    switch (action.type) {
        case 'dialogs.message':
            return <Dialog key={key} title={'Info'} onClose={onClose}>
                {action.payload.message}
            </Dialog>;

        case 'dialogs.2fa-methods':
            return <Dialog key={key} title={'2FA methods'} actions={action.payload.methods.map((method, index) => {
                return {
                    label: method,
                    onClick: () => select2FAMethod(index).then(res => res.status === 200 && onClose())
                };
            })} onClose={onClose}>
                A 2FA code is required for the fetching of reports, please select 2FA method below.
            </Dialog>;

        case 'dialogs.2fa-code':
            const id = `2fa-code-input-dialog-${key}`;
            return <Dialog key={key} title={'2FA code'} actions={[{
                label: 'Submit',
                onClick: () => {
                    const input = document.getElementById(id) as HTMLInputElement | null;
                    if (!input) return;
                    const code = input.value.trim();
                    if (!code) return;
                    submit2FACode(code).then((res) => res.status === 200 && onClose())
                }
            }]} onClose={onClose}>
                <span>Please await and enter the 2FA code sent to your trusted device or phone number.</span>
                <br />
                <input type='text' id={id} placeholder='2FA code' className={dialogStyles.addKeyInput} />
            </Dialog>;
    }
}


const Main = () => {
    const context = useContext(DataContext);
    if (!context) return null;

    const [displayReports, setDisplayReports] = useState(false);
    const [dialogs, setDialogs] = useState<JSX.Element[]>([]);

    useEffect(() => {
        const unsubscribe = actionDispatcher.subscribe((action) => {
            setDialogs((prev) => {
                const key = Date.now().toString();
                const close = () => setDialogs((d) => d.filter((e) => e.key !== key));

                return [...prev, getDialog(key, action, close)];
            });
        });

        return unsubscribe;
    }, []);

    return (
        <div className={styles.main}>
            {displayReports && <div className={styles.reports}> <Reports /> </div>}
            <div className={styles.map} style={{ gridColumn: displayReports ? '2 / span 2' : '1 / span 3' }} id='map'>
                <Map displayReports={displayReports} setDisplayReports={setDisplayReports} />
            </div>
            <div className={styles.tags}> <Tags /> </div>

            {dialogs.map((dialog) => dialog)}
        </div>
    )
};

export default Main;