const SECTION_FORM_IDS:Readonly<Record<string,string>>={
  'colabore-formulario':'collaborate',
}

export const resolveSectionFormId=(sectionId:string)=>SECTION_FORM_IDS[sectionId]??null
