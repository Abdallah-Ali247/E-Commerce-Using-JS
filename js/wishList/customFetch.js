
export class CustomFetch {
    constructor(endPoint, pointID, data) {
        this.endPoint = endPoint; // set end point
        this.pointID = pointID; // id of data 
        this.data = data; // data to be sent
    }
    // Fetch data from JSON Server
    async fetchData() {  
        try { // initialize the url of data if there is an id or just an end poinr
            let url;
            if(this.pointID){
                url = `http://localhost:3001/${this.endPoint}/${this.pointID}`;
            } else {
                url = `http://localhost:3001/${this.endPoint}`;
            }
            // Fetch data from the server
            const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${this.endPoint}`);
        }
        const objData = await response.json(); // convert response to obj
        return objData;
        } catch (error) {
        console.error("Error fetching products:", error);
        }
    }

    async putData() {
        try {
            const response = await fetch(`http://localhost:3001/${this.endPoint}/${this.pointID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.data),
            });
    
            if (!response.ok) {
                throw new Error(`Failed to update data at : ${response.statusText}`);
            }
    
            const updatedData = await response.json();
            return updatedData;
        } catch (error) {
            console.error(`Error during PUT request to `, error);
            throw error; // Re-throw for further handling if needed
        }
    }
    
};



let data = new CustomFetch('products',"1");
data.fetchData().then(data => {
    console.log(data);
}).catch(error => {
    console.error(error);
});
