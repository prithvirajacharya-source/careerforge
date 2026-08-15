export type JsonStat2 = { id?: string[]; size?: number[]; dimension?: Record<string,{category?:{index?:Record<string,number>;label?:Record<string,string>}}>; value?:Array<number|null> };

export function jsonStatValue(dataset: JsonStat2, selections: Record<string,string>) {
  if (!dataset.id || !dataset.size || !dataset.value) throw new Error("PxWeb response is missing dimensions or values.");
  let offset = 0;
  for (let i=0;i<dataset.id.length;i++) {
    const id=dataset.id[i]; const selected=selections[id];
    const position=selected===undefined ? 0 : dataset.dimension?.[id]?.category?.index?.[selected];
    if (position===undefined) throw new Error(`PxWeb response is missing requested ${id} value ${selected}.`);
    offset += position * dataset.size.slice(i+1).reduce((product,size)=>product*size,1);
  }
  const value=dataset.value[offset];
  return typeof value==="number"&&Number.isFinite(value)?value:null;
}
