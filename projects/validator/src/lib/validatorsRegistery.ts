import { Validator } from "../public-api";
import { ValidationId } from "../public-api";


const registery = new Map<ValidationId,Validator>()


export const registerValidator = (name:ValidationId,fn:Validator) => registery.set(name,fn);

export const getValidationFn = (name:ValidationId) => (data:Model) => {
    const fn = registery.get(name)
    if (!fn) {
        throw new Error(`No validator found with name "${name}"`);        
    }
    return (data:Model) => fn(data,name);
}

export const getValidator = (name:ValidationId) => {
    const fn = registery.get(name)
    if (!fn) {
        throw new Error(`No validator found with name "${name}"`);        
    }
    return fn;  
}