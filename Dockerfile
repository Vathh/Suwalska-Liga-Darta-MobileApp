FROM node:16-alpine
WORKDIR /appl2
COPY /sld_mobile/package*.json ./
RUN npm install
COPY /sld_mobile .
CMD ["npm", "run", "web"]
