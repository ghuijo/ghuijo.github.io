---
layout: post
title: LeRobot Pi0 Finetuning Tutorial
date: 2025-08-29
description:
tags: Imitation_leaning, LeRobot, Pi0
categories: robotics
---

This is a blog post on how to finetune LeRobot Pi0 with SO-ARM101.


## References
[LeRobot Imitation Learning Tutorial](https://huggingface.co/docs/lerobot/il_robots)

[LeRobot Pi0 and Pi0-fast Blog](https://huggingface.co/blog/pi0)


## Experiment environment
- Robot: SO-ARM101
- GPU: Tesla A100 SXM4 40GB
- OS: Ubuntu 20.04 LTS
- NVIDIA Driver: 570.169 (CUDA 12.8)


## Anaconda environment setup
- **Install Python 3.10 or higher**

- **Install PyTorch**
Currently, LeRobot only supports PyTorch versions below 2.8.
Use the following command to install a compatible version:
```bash
pip install torch==2.7.1 torchvision==0.22.1 torchaudio==2.7.1 --index-url https://download.pytorch.org/whl/cu128
```

- **Log in to WandB & Hugging Face**
```bash
wandb login
```
(Tip: If your school email can be verified, you can use WandB for free — even after graduation.)
```bash
huggingface-cli login
```

- **Install Additional Required Libraries**
```bash
pip install transformers iniconfig pytest
```

- Depending on your environment, you might get an error asking you to install ffmpeg.
There are several ways to install it, but the following method worked most cleanly:
```bash
conda install -n pi0 -c conda-forge "ffmpeg>=6,<8"
```
👉 This installs ffmpeg (version ≥6 and <8) into the conda environment named pi0.

- **Request Access to the Pretrained Model (PaliGemma)**
Get access here:
🔗 https://huggingface.co/google/paligemma-3b-pt-224


## Pi0 finetuning
When you install LeRobot, it automatically links the command lerobot-train to train.py.
However, you can also run it directly like this.
Since the command is quite long, it’s convenient to save it as a train.sh file and run it using:
```bash
sh train.sh
```

- Example training command:
```bash
CUDA_VISIBLE_DEVICES=3 python src/lerobot/scripts/train.py \
--policy.path=lerobot/pi0 \
--dataset.repo_id={HF_USER}/{data_name} \
--output_dir=outputs/train/{project_name} \
--job_name=pi0_so101_finetune \
--policy.device=cuda \
--policy.repo_id=None \
--task="move doll into a cup" \
--wandb.enable=true \
--wandb.project="{project_name}"
```

- Parameter explanations:
policy.path – If you’re using pretrained model weights, specify the Hugging Face repository containing those weights.<br>
policy.repo_id – If you want to automatically upload your trained model to Hugging Face during training, specify your own repository here.<br>
task – I didn’t realize at first, but this is where you input the text prompt that serves as a language command for the model.<br>
wandb.enable – Set this to true to visualize your training logs as graphs on the WandB dashboard.<br>

- config setting:
num_episode: 50 <br>
batch_size: 8 <br>
save_steps: 5000 / 10000 <br>
"freeze_vision_encoder": true, <br>
"train_expert_only": **false**, <br>
"train_state_proj": true


- Modifying Training Configuration:
In src/lerobot/configs/train.py, you can adjust parameters such as:<br>
num_workers, batch_size, steps, eval_freq, log_freq, and save_freq.<br>
In src/lerobot/policies/pi0/configuration_pi0.py, you can modify additional options such as train_expert_only and related settings.


## Uploading a Trained Model to Hugging Face (Specific Checkpoint)

To upload a specific checkpoint to Hugging Face, use the following command:
```bash
huggingface-cli upload {HF_USER}/{project_name} outputs/train/{project_name}/checkpoints/{checkpoint_step}/pretrained_model
```
There is no need to manually create the repository in advance — it will be created automatically as a public repository during upload.


## Inference

```bash
lerobot-record  \
--robot.type=so100_follower \
--robot.port=/dev/ttyACM1 \
--robot.cameras="{ up: {type: opencv, index_or_path: /dev/video10, width: 640, height: 480, fps: 30}, side: {type: intelrealsense, serial_number_or_name: 233522074606, width: 640, height: 480, fps: 30}}" \
--robot.id=my_awesome_follower_arm \
--display_data=false \
--dataset.repo_id=${HF_USER}/eval_so100 \
--dataset.single_task="Put lego brick into the transparent box" \
# <- Teleop optional if you want to teleoperate in between episodes \
# -teleop.type=so100_leader \
# -teleop.port=/dev/ttyACM0 \
# -teleop.id=my_awesome_leader_arm \
- -policy.path=${HF_USER}/my_policy
```


## Some comments

Unlike ACT or Diffusion Policy, which are trained from scratch, I fine-tuned Pi0 and ran inference with it.
Even though the training data were collected only in bright indoor environments with the lights on, the robot still managed to perform tasks pretty accurately even in darker settings.

From what I’ve seen in GitHub issues and tutorials, Pi0 tends to work best when it’s heavily overfitted to a small number of tasks — kind of the opposite of what you’d expect from a general foundation model.
It seems that even large-scale robot foundation models struggle with the huge diversity in robot hardware, task types, and data collection environments.

I’m really curious to see how GROOT handles this.

<br>
<br>
Feel free to reach out if you run into any problems or have suggestions for improving this setup!
