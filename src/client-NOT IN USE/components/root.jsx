import React, { useState, useEffect } from 'react';
import {
    RcThemeProvider,
    RcLoading
} from '@ringcentral/juno';
import { MessageEditor } from './messageEditor';

export function App({ client }) {
    const [loading, setLoading] = useState(false);
    return (
        <RcThemeProvider>
            <MessageEditor/>
            {/* <RcLoading loading={loading}>
            </RcLoading> */}
        </RcThemeProvider>
    );
}