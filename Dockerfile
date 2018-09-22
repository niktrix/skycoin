# Build Geth in a stock Go builder container
FROM golang:1.10-alpine as builder

RUN echo -e "https://mirror.csclub.uwaterloo.ca/alpine/v3.8/main\nhttps://mirror.csclub.uwaterloo.ca/alpine/v3.8/community" > /etc/apk/repositories


RUN apk add --no-cache make bash gcc musl-dev linux-headers git 

WORKDIR /go/src/github.com/skycoin/skycoin
COPY . .
RUN go get github.com/skycoin/skycoin/...
RUN cd /go/src/github.com/skycoin/skycoin
ENV RPC_ADDR="http://0.0.0.0:6420" 
EXPOSE 6000 6420
ENTRYPOINT ["/go/src/github.com/skycoin/skycoin/run.sh"]
