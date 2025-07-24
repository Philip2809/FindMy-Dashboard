import { createRef } from 'react';
import sharedStyles from './components.module.scss';
import { FaCopy } from "react-icons/fa";

export const CopyText = ({ children, text }: { children?: React.ReactNode; text: string; }) => {

    const textElementRef = createRef<HTMLElement>();

    return (
        <>
            <span ref={textElementRef}>{children ?? text}</span>
            <span> </span>
            <FaCopy className={sharedStyles.copyTextBtn} onClick={() => {
                navigator.clipboard.writeText(text);
                if (!textElementRef.current) return; // TODO: obscure error handling
                const range = document.createRange();
                const selection = window.getSelection();
                range.selectNodeContents(textElementRef.current);
                selection?.addRange(range);
            }} />
        </>
    )
};
