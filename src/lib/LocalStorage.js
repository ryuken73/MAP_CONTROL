export const storage = {
    // from https://developer.mozilla.org/ko/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
    open(type){
        try {
            const storage = window[type];
            const x = '__storage_test__';
            storage.setItem(x, x);
            storage.removeItem(x);
            this.storage = storage;
            return this;
        }
        catch(e) {
            return e instanceof DOMException && (
                // Firefox를 제외한 모든 브라우저
                e.code === 22 ||
                // Firefox
                e.code === 1014 ||
                // 코드가 존재하지 않을 수도 있기 때문에 테스트 이름 필드도 있습니다.
                // Firefox를 제외한 모든 브라우저
                e.name === 'QuotaExceededError' ||
                // Firefox
                e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
                // 이미 저장된 것이있는 경우에만 QuotaExceededError를 확인하십시오.
                window[type].length !== 0;
        }
    },
    get(key){
        const value = this.storage.getItem(key);
        try{
            return JSON.parse(value);
        }catch(err){
            return value;
        }
    },
    set(key, value){
        this.storage.setItem(key, JSON.stringify(value));
    },
    del(key){
        this.storage.removeItem(key);
    }
}
