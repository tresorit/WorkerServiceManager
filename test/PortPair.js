module.exports = class PortPair {
    constructor(){
        this.port1 = {
            onmessage: null,
            postMessage: (data) => { //noinspection JSCheckFunctionSignatures
                this.port2.onmessage({data})}
        };

        this.port2 = {
            onmessage: null,
            postMessage: (data) => { //noinspection JSCheckFunctionSignatures
                this.port1.onmessage({data})}
        };
    }
};
