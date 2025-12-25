# StreamTranslate AI
Aplicación de escritorio para traducción en tiempo real con múltiples opciones de reconocimiento de voz y traducción.
 es una aplicación de escritorio desarrollada con Electron y React, diseñada para realizar traducciones en tiempo real durante transmisiones en vivo o grabaciones. Su objetivo principal es facilitar la comunicación multilingüe, especialmente en contextos de streaming, gaming o contenido audiovisual, permitiendo traducir audio hablado a texto y luego a otros idiomas de manera automática y fluida

 Filtros de Palabras: Permite reemplazar palabras específicas en tiempo real, útil para moderar contenido o adaptar el lenguaje.
 Traduce principalmente de español a inglés, con opción adicional de traducción a japonés.
 tiene un indicador en todo momento en las opciones tenermos la ocion de descargar el modelo con el indicador de% de descarga o si esta descargado un indicador verde y nos permita elegir el modelo o tipo de traduccion o transcripccion.
 seleccionador de fuente de audio ahi seleccionar que microfono usar de los disponibles. y

## Características

- 🎤 **Reconocimiento de voz múltiple**: Whisper local, (integrado de Windows),
- 🌐 **Traducción avanzada**: Modelos locales NLLB o IA en la nube con Gemini o alguna biblioteca de traduccion gratuita
- 🎭 **Estilos anime**: Fuentes y efectos visuales estilo anime para el overlay
- 🎯 **Filtros de palabras**: Reemplaza palabras en tiempo real
- 📺 **Integración OBS**: Overlay transparente para streaming
- 🔄 **Traducción dual**: Español → Inglés + Japonés opcional
- 🖥️ **Aplicación de escritorio**: Ejecutable nativo sin navegador

## Configuración

- **Modelo Local**: Funciona sin conexión a internet
- **Speech Windows**: Usa el reconocimiento integrado de Windows (más rápido)
- **Gemini API**: Traducción en tiempo real con IA avanzada (requiere API key)

## Uso con OBS

1. En la aplicación, copia la URL del overlay
2. En OBS, agrega una fuente "Browser"
3. Pega la URL del overlay
4. Configura CSS: `background-color: transparent;`