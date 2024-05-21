import React, { useLayoutEffect, createContext, useState } from 'react';

export const TimerContext = createContext({
    time: false,
    setTime: () => {},
})

const TimerProvider = ({ children }) => {
    const [ time, setTime ] = useState(
        localStorage.getItem('time') === '' ? '' : localStorage.getItem('time'));
   
	useLayoutEffect(() => {
		localStorage.setItem('time', time);
	}, [time]);

    return (
        <TimerContext.Provider value={{
            time,
            setTime,
        }}>
            {children}
        </TimerContext.Provider>
    )
}

export default TimerProvider;