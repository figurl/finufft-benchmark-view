from dendro.sdk import ProcessorBase, BaseModel, Field, OutputFile

class FinufftBenchmarkContext(BaseModel):
    output: OutputFile = Field(description='Output .json file')
    commit_hash: str = Field(description='Git commit hash')


class FinufftBenchmarkProcessor(ProcessorBase):
    name = 'finufft_benchmark'
    description = 'Run a finufft benchmark for a particular git commit'
    label = 'finufft_benchmark'
    image = 'magland/dendro-hello-finufft-benchmark:0.1.0'
    executable = '/app/main.py'
    attributes = {}

    @staticmethod
    def run(
        context: FinufftBenchmarkContext
    ):
        import subprocess
        output = context.output
        commit_hash = context.commit_hash

        install_finufft(commit_hash=commit_hash)

        cmd = 'finufft-benchmark run --output finufft-benchmark.json'
        subprocess.run(cmd, shell=True, check=True)

        output.upload('finufft-benchmark.json')


def install_finufft(commit_hash: str):
    import subprocess
    bash_script = f'''
#!/bin/bash

set -ex

git clone https://github.com/flatironinstitute/finufft
cd finufft
git checkout {commit_hash}
cp make.inc.linux make.inc
make test -j
make python -j
'''

    with open('install_finufft.sh', 'w') as f:
        f.write(bash_script)

    result = subprocess.run(['bash', 'install_finufft.sh'], capture_output=False, text=True, check=False)
    if result.returncode != 0:
        raise Exception(f'Problem installing finufft: {result.returncode}')
