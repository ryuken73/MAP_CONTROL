const fromArray = [0,1,2,3,4,5,6,7];
export const exchange = array => {
    return {
        fromIndex : fromIndex => {
            return {
                toIndex : toIndex => {
                    return array.map((element, index) => {
                        if(index === fromIndex){
                            return array[toIndex] || element;
                        }
                        if(index === toIndex){
                            return array[fromIndex] || element;
                        }
                        return element;
                    })
                }
            }
        }
    } 
}

export const remove = array => {
    const MIN_INDEX = 0;
    const MAX_INDEX = array.length - 1;
    return {
        fromIndex: fromIndex => {
            try {
                if(fromIndex < MIN_INDEX || fromIndex > MAX_INDEX){
                    throw new Error('invalid range');
                }
                return [...array.slice(0, fromIndex), ...array.slice(fromIndex+1)]
            } catch (err) {
                throw new Error(err)
            }
        }
    }
}

export const add = array => {
    const MIN_INDEX = 0;
    const MAX_INDEX = array.length;
    return {
        toIndex: toIndex => {
            try {
                if(toIndex < MIN_INDEX || toIndex > MAX_INDEX){
                    throw new Error('invalid range');
                }
                return {
                    value: value => {
                       return [...array.slice(0, toIndex), value, ...array.slice(toIndex)]
                    }
                }
            } catch (err) {
                throw new Error(err)
            }
        }
    }
}


export const moveTo = array => {
    const MIN_INDEX = 0;
    const MAX_INDEX = array.length - 1;
    return {
        fromIndex: fromIndex => {
            try {
                if(fromIndex < MIN_INDEX || fromIndex > MAX_INDEX){
                    throw new Error('invalid range');
                }
                return {
                    toIndex: toIndex => {
                        try {
                            if(toIndex < MIN_INDEX || toIndex > MAX_INDEX){
                                throw new Error('invalid range');
                            }
                            const MOVE_NOT = fromIndex === toIndex;
                            const MOVE_UP = fromIndex < toIndex;
                            const MOVE_DOWN = fromIndex > toIndex;
                            return array.map((element,index) => {
                                if(MOVE_UP) {
                                    if(index < fromIndex) return element;
                                    if(index >= fromIndex && index < toIndex){
                                        return array[index+1];
                                    }
                                    if(index === toIndex) return array[fromIndex];
                                }
                                if(MOVE_DOWN) {
                                    if(index < toIndex) return element;
                                    if(index === toIndex) return array[fromIndex];
                                    if(index > toIndex && index <= fromIndex){
                                        return array[index-1];
                                    }
                                }
                                if(MOVE_NOT) return element;
                                return element;
        
                            })
                        } catch (err) {
                            throw new Error(err)
                        }
                    }
                }
            } catch (err) {
                throw new Error({toIndex:() => {}})
            }

        }
    }
}
// const x = exchange(fromArray).fromIndex(0).toIndex(2);
// const y = exchange(fromArray).fromIndex(4).toIndex(2);
// const z = exchange(fromArray).fromIndex(4).toIndex(12);
// const a = exchange(fromArray).fromIndex(12).toIndex(11);

// const x = moveTo(fromArray).fromIndex(0).toIndex(2);
// const y = moveTo(fromArray).fromIndex(4).toIndex(2);
// const z = moveTo(fromArray).fromIndex(4).toIndex(12);
// const a = moveTo(fromArray).fromIndex(12).toIndex(11);
// console.log(x)
// console.log(y)
// console.log(z)
// console.log(a)
