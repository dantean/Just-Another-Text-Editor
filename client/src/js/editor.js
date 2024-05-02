// Import methods to save and get data from the indexedDB database in './database.js'
import { getDb, putDb } from './database';
import { header } from './header';

export default class {
  constructor() {
    const localData = localStorage.getItem('content') || header;

    // Check if CodeMirror is loaded
    if (typeof CodeMirror === 'undefined') {
      throw new Error('CodeMirror is not loaded');
    }

    this.editor = CodeMirror(document.querySelector('#main'), {
      value: header,
      mode: 'javascript',
      theme: 'monokai',
      lineNumbers: true,
      lineWrapping: true,
      autofocus: true,
      indentUnit: 2,
      tabSize: 2,
    });

    // When the editor is ready, set the value to whatever is stored in IndexedDB.
    // Fall back to localStorage if nothing is stored in IndexedDB, and if neither is available, set the value to header.
    getDb().then((data) => {
      console.info('Loaded data from IndexedDB, injecting into editor');
      console.log('Data from IndexedDB:', data);  // Log the actual data fetched
      console.log('Type of data from IndexedDB:', typeof data);  // Log the type of data fetched

      if (typeof data === 'string') {
        this.editor.setValue(data);
      } else if (typeof data === 'object' && data !== null) {
        try {
          const jsonData = JSON.stringify(data);
          this.editor.setValue(jsonData);
        } catch (e) {
          console.error('Error stringifying data:', e);
          this.editor.setValue(localData);  // Use localData as a fallback
        }
      } else {
        console.error('Received non-string and non-object data from IndexedDB:', data);
        this.editor.setValue(localData);  // Use localData as a fallback
      }
    }).catch(error => {
      console.error('Failed to load data from IndexedDB:', error);
      this.editor.setValue(localData);  // Use localData as a fallback in case of error
    });

    this.editor.on('change', () => {
      const currentEditorValue = this.editor.getValue();
      console.log('Saving current editor value to localStorage:', currentEditorValue);
      localStorage.setItem('content', currentEditorValue);
    });

    // Save the content of the editor when the editor itself loses focus
    this.editor.on('blur', () => {
      const currentEditorValue = this.editor.getValue();
      console.log('The editor has lost focus, saving to IndexedDB:', currentEditorValue);
      putDb(currentEditorValue);
    });
  }
}
