export const setUniqAreasFromSources = (cctvs, setFunction) => {
    const areasOnly = cctvs.map(cctv => {
        return cctv.title.split(' ')[0]
    })
    const uniqAreas = [...new Set(areasOnly)];
    setFunction(uniqAreas);
    return uniqAreas;
}
      
export const groupCCTVsByArea = (uniqAreas, cctvs, setFunction) => {
    const grouped = new Map();
    uniqAreas.forEach(area => {
        const cctvsInArea = cctvs.filter(cctv => {
        return cctv.title.startsWith(area);
        })
        grouped.set(area, cctvsInArea);
    })
    setFunction(grouped);
}
    
