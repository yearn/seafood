import React from 'react';


function ShowEvents({events}){
	console.log(events);

    

	return <div>
		{events.map(e => {
			if(e.event){
				return <div key={e.data}> {e.event + ' ' + Object.entries(e.args).map(x => {
					if(isNaN(x[0])){
						return ' - ' + x[0]+ ':' +x[1];
					}
					
				}).join('')}</div>;
			}   
			
		})}
	</div>;
}



export default ShowEvents;