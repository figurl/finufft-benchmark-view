FROM python:3.9

# Install fftw-dev and g++
RUN apt-get update && apt-get install -y libfftw3-dev g++

# Install dendro
RUN pip install dendro && echo "v1"

# Install finufft-benchmark
RUN git clone https://github.com/scratchrealm/finufft-benchmark && cd finufft-benchmark && pip install .

# finufft will get installed by the app processor at a certain commit

# Copy files into the container
COPY *.py /app/

# Set the working directory
WORKDIR /app
