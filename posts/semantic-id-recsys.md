---
title: Semantic ID for mordern recommendation system
date: 2025-09-13
category: Technology
excerpt: A brief description of approaches to generate semantic IDs.
tags: ["RecSys"]
---
# Semantic ID for modern Recommendation System

## Table of Contents
- [Semantic ID for modern Recommendation System](#semantic-id-for-modern-recommendation-system)
  - [Table of Contents](#table-of-contents)
  - [Intuition: NLP \<\> Recommendation system](#intuition-nlp--recommendation-system)
    - [From word vectors to item understanding (2013)](#from-word-vectors-to-item-understanding-2013)
    - [GRU4Rec (2015)](#gru4rec-2015)
    - [BERT2Rec (2019)](#bert2rec-2019)
    - [Generative Recommendation (2022 - now)](#generative-recommendation-2022---now)
  - [The fundamental problem with traditional IDs](#the-fundamental-problem-with-traditional-ids)
    - [Massive embedding table overhead](#massive-embedding-table-overhead)
    - [The cold-start catastrophe](#the-cold-start-catastrophe)
    - [Data sparsity and maintenance overhead](#data-sparsity-and-maintenance-overhead)
    - [Why semantic IDs solve these problems](#why-semantic-ids-solve-these-problems)
  - [The general Idea - vector quantization](#the-general-idea---vector-quantization)
  - [Industry innovations at massive scale: Google, Kuaishou, Snapchat](#industry-innovations-at-massive-scale-google-kuaishou-snapchat)
    - [Google: TIGER\[2\]](#google-tiger2)
    - [Kuaishou: OneRec\[8\]](#kuaishou-onerec8)
    - [Baide: Sparse Meets Dense\[9\]](#baide-sparse-meets-dense9)
  - [Conclusion](#conclusion)
  - [Future Directions](#future-directions)

## Intuition: NLP <> Recommendation system


Modern recommendation systems are undergoing a fundamental transformation. Instead of relying on arbitrary, meaningless identifiers like "item_12847," today's most advanced systems represent items through semantic IDs—content-derived tokens that capture the essence of what items actually are. This paradigm shift, inspired by breakthroughs in natural language processing, is solving longstanding challenges in cold-start scenarios, long-tail recommendations, and system scalability while opening new possibilities for interpretable, generalizable AI. [1]

The revolution stems from a simple insight: if we can represent words semantically in NLP, why not items in recommendations? This conceptual leap has enabled systems like YouTube's production ranking engine[2] and Meta's advertising platform[3] to achieve significant improvements in both performance and efficiency. Semantic IDs now serve as the foundation for next-generation recommendation architectures that understand content meaning rather than simply memorizing interaction patterns.

### From word vectors to item understanding (2013)
The journey began in 2013 with word2vec's[4] breakthrough demonstration that words could be meaningfully embedded in vector spaces where semantic similarity translated to geometric proximity. The leap to recommendation systems came through Item2Vec[5] (2016), where Microsoft researchers recognized that items appearing together in user sessions exhibit relationships similar to words appearing in similar contexts. 

The technical adaptation was elegant: treating user purchase sequences as "sentences" and individual items as "words." Instead of predicting nearby words from context windows, Item2Vec predicted co-occurring items within user interaction sequences. Items frequently bought together received similar embeddings, just as semantically related words cluster in embedding space. However, this methods can not handle new items, and lacks temporal dynamics.
 ![Two-dimensional PCA projection of the 1000-dimensional Skip-gram vectors of countries and their capital cities.](images/posts/word2vec.png "Skip-gram vectors")


### GRU4Rec (2015)

Sequential modeling emerged next with GRU4Rec[6] (2015), which introduced temporal dynamics by applying recurrent neural networks (RNN) to model entire user sessions. This addressed a critical limitation of static approaches—the inability to capture how user preferences evolve within sessions. GRUs were chosen over LSTMs for computational efficiency while maintaining sequence modeling capabilities, enabling recommendations for anonymous users based purely on current session behavior. However, GRU4Rec only considers left-to-right context, and also become more expensive with long user behavior sequences.

### BERT2Rec (2019)
The bidirectional revolution arrived with BERT4Rec[7] (2019), adapting BERT's transformer architecture to capture both past and future context in user sequences. The key innovation solved the "information leakage" problem through a Cloze task—masking random items in sequences and predicting them from surrounding context. This bidirectional approach provided richer understanding of user preferences while enabling parallel processing that RNN-based models couldn't achieve. Altought its promising performance, it is memory-intensive, slow inference, and needs extentive pre-training.

 ![Differences in sequential recommendation model architectures.](images/posts/bert4rec.png "BERT4Rec")

### Generative Recommendation (2022 - now)
Most recently, **generative paradigms with semantic IDs** have emerged as the cutting edge of recommendation systems. Instead of generating natural language descriptions, these systems learn to generate sequences of semantic ID tokens that represent items. The breakthrough insight is treating item recommendation as a sequence generation problem where each item is represented by its hierarchical semantic tokens (e.g., [12, 153, 87] for a sci-fi thriller).

Systems like TIGER[2] demonstrate this approach by learning to predict semantic ID sequences autoregressively. When a user has interacted with items represented as [genre_token, style_token, theme_token], the model generates new sequences sharing semantic properties. This enables zero-shot recommendations for new items—as soon as content is encoded into semantic IDs, it can be recommended based on semantic similarity rather than requiring interaction history.

![Tiger](images/posts/tiger.png)

This progression reveals a clear pattern: each advance in NLP consistently translates to recommendation systems with appropriate architectural adaptations, suggesting continued potential for future NLP breakthroughs to transform recommendation technology.

## The fundamental problem with traditional IDs

Traditional recommendation systems rely on arbitrary identifiers—simple integers like "item_12847" or "user_98123"—that carry no inherent meaning. While these systems have powered the recommendation engines of major platforms for decades, they face increasingly severe limitations as the digital ecosystem grows more complex and dynamic.

### Massive embedding table overhead

The most immediate challenge is **memory scalability**. Modern platforms like YouTube handle over 2 billion videos, Amazon catalogs hundreds of millions of products, and TikTok processes billions of short videos. Each item requires a dense embedding vector (typically 64-512 dimensions of 32-bit floats), resulting in embedding tables consuming hundreds of gigabytes to terabytes of memory. For a catalog of 100 million items with 256-dimensional embeddings, the storage requirement alone exceeds 100GB, not including the additional infrastructure for efficient retrieval and updates.

This massive memory footprint creates operational challenges: increased hardware costs, slower model loading times, and complex distributed storage systems. More critically, the memory requirements grow linearly with catalog size, making traditional approaches unsustainable for platforms experiencing rapid content growth.

### The cold-start catastrophe

Traditional ID-based systems face an **insurmountable cold-start problem**. New items begin with randomly initialized embeddings that carry no semantic information, requiring substantial interaction data before becoming meaningful. A newly uploaded YouTube video or recently listed Amazon product effectively doesn't exist in the recommendation system until users discover it organically—creating a chicken-and-egg problem where items need exposure to gain exposure.

The impact is particularly severe for:
- **Long-tail content creators**: New YouTubers struggle to gain initial traction without recommendation system support
- **Seasonal or trending products**: Time-sensitive items may expire before accumulating sufficient interaction data
- **Niche categories**: Specialized content suffers from limited user overlap needed for collaborative filtering

Research shows that 40-60% of new items on major platforms receive fewer than 10 interactions in their first week, rendering them effectively invisible to traditional recommendation algorithms.

### Data sparsity and maintenance overhead

The **sparsity challenge** compounds over time. As catalogs grow, the fraction of item pairs with overlapping user interactions decreases exponentially. A platform with 10 million items and 1 million users typically achieves less than 0.01% density in user-item interaction matrices, making collaborative filtering increasingly unreliable for discovering meaningful item relationships.

Furthermore, traditional systems require **continuous embedding updates** as user preferences evolve and new interaction patterns emerge. This creates significant computational overhead: retraining embedding tables, managing version conflicts, and ensuring consistency across distributed systems. The maintenance burden grows with both catalog size and user base, requiring increasingly sophisticated infrastructure to maintain recommendation quality.

### Why semantic IDs solve these problems

Semantic IDs address these fundamental limitations through **content-derived representations**. Instead of arbitrary integers, items are represented by semantically meaningful token sequences that encode their actual properties. A science fiction movie might be represented as [genre_12, style_153, director_87], where each token captures genuine content attributes rather than memorized interaction patterns.

This approach delivers **immediate cold-start resolution**—new items inherit semantic properties from their content without requiring interaction history. **Memory efficiency** improves dramatically through discrete tokenization (3-8 integers vs. 256+ floats per item). **Maintenance overhead** decreases since semantic representations remain stable as content properties don't change, unlike interaction-dependent embeddings that require frequent updates.

The transition from arbitrary IDs to semantic IDs represents a paradigm shift from memorization-based to understanding-based recommendation systems, enabling both better performance and sustainable scalability.

## The general Idea - vector quantization
**Vector quantization provides the theoretical foundation** that transforms continuous embeddings into discrete, semantically meaningful tokens. Traditional VQ maps high-dimensional vectors to finite codebooks, but modern semantic ID systems employ sophisticated Residual Quantization Variational AutoEncoders (RQ-VAE) that create hierarchical representations. 

The process begins with extracting rich content embeddings using pre-trained CLIP for text and images, VideoCLIP for multimodal content. These continuous representations are then quantized through a hierarchical process where each level captures different semantic granularities. Level 1 might represent broad categories like "Science Fiction," Level 2 refines to "Space Opera," and Level 3 captures specific attributes like "Hard Science Fiction." 

RQ-VAE architecture consists of three core components working in sequence:

1. Encoder: Maps raw content (text, images, video) to continuous latent representations z = E(x) using neural networks like ResNet for images or Transformer encoders for text
2. Residual Quantizer: The hierarchical quantization core with M levels of codebooks {C₁, C₂, ..., Cₘ}, each containing K vectors
3. Decoder: Reconstructs content from quantized representations x̂ = D(z_q) using transposed convolutions or Transformer decoders

The residual quantization process works through multi-stage refinement. Stage 1 applies standard vector quantization: x̂₁ = Q₁(z) where Q₁ finds the nearest codebook vector in C₁. Stage 2 quantizes the residual: r₁ = z - x̂₁, then r̂₁ = Q₂(r₁) using codebook C₂. This continues recursively across M levels, with final reconstruction as z_q = Σᵢ₌₁ᴹ r̂ᵢ. The approach achieves exponential expressiveness—M codebooks of size K each can represent K^M unique vectors using only M×K stored codewords. The **training objective** balances reconstruction quality with quantization stability: L = ||x - Dec(z_q)||² + ||sg[z_e] - e_k||² + β||z_e - sg[e_k]||², where the first term ensures faithful reconstruction, the second updates codebook vectors, and the third prevents encoder drift through commitment loss.

![RQ-VAE](images/posts/rqvae.png)

Let L be the number of layers (i.e., length of the sequence) and K be the codebook size (i.e., number of clusters at each layer),  resulting in K^L total clusters. The precision of vector quantization increases as one moves from the first token, to the deeper tokens. Hence, a tradeoff exists between the cardinality of the token parameterization and the amount of information the model receives from Semantic ID.

**Semantic ID advantages over continuous embeddings** are profound. Memory compression achieves 100-200x reduction in storage requirements—storing 3-8 integer tokens per item instead of 768-dimensional float vectors. Inference speed improves dramatically through O(1) integer indexing versus O(d) vector operations. Most importantly, semantic IDs solve cold-start problems by enabling new items to immediately inherit semantic properties from content without requiring interaction history.

The hierarchical structure enables **interpretable recommendations**. When a system recommends a movie with semantic ID [12, 153, 87, 21], each token provides insight: 12 represents the Science Fiction genre, 153 indicates mind-bending thriller subgenre, 87 captures Christopher Nolan's directorial style, and 21 represents dream/consciousness themes. This transparency enables both explainable recommendations and controllable generation.

There are also other methods on generating semantic IDs. For more technical details and how to implement them, please checkout my github on educational implementations: [vector-quantization](https://github.com/louiswang524/vector-quantization/)

## Industry innovations at massive scale: Google, Kuaishou, Snapchat
### Google: TIGER[2]
Major technology companies have deployed semantic ID systems in production with measurable business impact. Google's TIGER (Transformer Index for GEnerative Recommenders) represents a breakthrough in generative retrieval for recommendation systems, published at NeurIPS 2023 by researchers from Google.
The TIGER framework consists of three core components:

1. Semantic ID Generation: Uses RQ-VAE (Residual Quantized Variational AutoEncoder) to convert item content embeddings into discrete semantic tokens. Items are first encoded using pre-trained models like Sentence-T5 for text features (title, brand, category, price), then quantized through 3-level residual quantization with 256 codewords per level, creating semantic IDs like (5, 25, 78).
2. Sequence-to-Sequence Architecture: Employs a Transformer encoder-decoder model built on T5X framework. The encoder processes historical user interaction sequences converted to semantic IDs, while the decoder autoregressively generates the semantic ID of the next item. The vocabulary includes 1,024 semantic codewords (256×4 levels) plus user-specific tokens.
3. Generative Retrieval Process: Instead of traditional retrieve-and-rank approaches, TIGER directly generates target item identifiers token-by-token. Given a user's sequence [item₁, item₂, item₃] → [SID₁, SID₂, SID₃], the model predicts SID₄ for the next recommendation.
   
Performance results show TIGER achieves state-of-the-art performance across Amazon datasets (Beauty, Sports & Outdoors, Toys & Games), significantly outperforming existing baselines including GRU4Rec, SASRec, BERT4Rec, and S3-Rec in Recall@K and NDCG@K metrics. The hierarchical semantic structure enables superior generalization for cold-start items, with top-level tokens capturing broad categories and lower-level tokens representing fine-grained attributes.

### Kuaishou: OneRec[8]
Kuaishou's comprehensive approach demonstrates semantic IDs' versatility across multiple products. Their breakthrough OneRec system represents the first industrial-scale end-to-end generative recommendation model, serving 400 million daily users across short-video and e-commerce platforms. 

![Onerec](images/posts/onerec.png)

Three Key Technical Components:

1. Encoder-Decoder with Sparse MoE Architecture
OneRec uses "an encoder-decoder structure, which encodes the user's historical behavior sequences and gradually decodes the videos that the user may be interested in" with "sparse Mixture-of-Experts (MoE) to scale model capacity without proportionally increasing computational FLOPs."

2. Session-Wise Generation Approach
Rather than traditional next-item prediction, OneRec proposes session-wise generation, which is more elegant and contextually coherent than point-by-point generation that relies on hand-crafted rules to properly combine the generated results. This approach considers the relative content and order of the items within each session.

3. Iterative Preference Alignment (IPA)
OneRec includes an Iterative Preference Alignment module combined with Direct Preference Optimization (DPO) to enhance the quality of the generated results. This addresses a unique challenge: Unlike DPO in NLP, a recommendation system typically has only one opportunity to display results for each user's browsing request, making it impossible to obtain positive and negative samples simultaneously.

The paper represents a major shift toward applying modern generative AI techniques to recommendation systems, moving away from complex multi-stage pipelines toward unified end-to-end approaches. It shows that techniques successful in language modeling (scaling laws, preference alignment) can be adapted effectively for recommendation tasks, potentially setting a new direction for the field.


### Baide: Sparse Meets Dense[9]

Both TIGER and OneRec have two stages: vector quantization to generate semantic ID, and then sequence modeling with transformers for generative recommendation. Baidu's paper claims that there is some information loss due to the separation of stages such as quantization and sequence modeling, and its COBRA (Cascaded Bi-Representation Architecture) Framework solves the challenge of integrating generative and dense retrieval methods.

![COBRA](images/posts/cobra.png)
1. COBRA innovatively integrates sparse semantic IDs and dense vectors through a cascading process where the method alternates between generating these representations by first generating sparse IDs, which serve as conditions to aid in the generation of dense vectors.
   
2. Coarse-to-Fine Generation Strategy: During inference, COBRA employs a coarse-to-fine generation process, starting with sparse ID that provides a high-level categorical sketch capturing the categorical essence of the item. The generated ID is then appended to the input sequence and fed back into the model to predict the dense vector that captures the fine-grained details.

3. BeamFusion Sampling: The framework introduces **BeamFusion**, a sampling technique combining beam search with nearest neighbor retrieval scores, ensuring controllable diversity in the retrieved items and an innovative approach combining beam search with nearest neighbor scores to enhance inference flexibility and recommendation diversity.

Common technical patterns emerge across implementations: multimodal content encoding, sophisticated quantization schemes (typically 3-8 hierarchical levels with 256-2048 entries per level), specialized tokenization approaches, and integration with existing ranking systems. Performance improvements consistently appear in cold-start scenarios, long-tail item recommendations, and memory efficiency from reducing embedding table size.

## Conclusion 
The latest developments (2023-2025) show remarkable advances in both performance and integration sophistication. RPG (KDD 2025) eliminates the autoregressive bottleneck through parallel prediction of long semantic IDs (up to 64 tokens), achieving 12.6% improvement in NDCG@10 over generative baselines while dramatically improving inference efficiency.

LLM integration represents the current frontier. FLIP[10] (Huawei) successfully aligns ID-based recommendation models with LLMs through joint learning, showing 6-17% improvements with 80% token size reduction. CALRec fine-tunes PaLM-2 for sequential recommendations, while RecGPT demonstrates zero-shot generalization across recommendation domains through unified item tokenization with Finite Scalar Quantization (FSQ). 

Unified architectures are emerging that combine the memorization capabilities of traditional ID-based systems with LLMs' generalization power. OneRec represents the first industrial-scale end-to-end generative model with encoder-decoder structure and sparse Mixture-of-Experts (MoE). LIGER combines dense retrieval with generative retrieval for optimal performance across different recommendation scenarios. 

Multimodal advances show sophisticated integration approaches. Progressive Semantic Residual Quantization (PSRQ) generates modal-specific and modal-joint semantic IDs while preserving prefix semantic features. Multi-Codebook Cross-Attention (MCCA) networks employ shared codebooks as cross-modal queries to model multimodal embedding sequences effectively. These approaches address modality correspondence challenges through late fusion with contrastive alignment training.

Recent theoretical advances include Mixture-of-Codes approaches using multiple independent codebooks for better LLM representation, DPCA (Discrete PCA) generalizing traditional quantization methods, and VQ-fusion frameworks for multi-task alignment. These innovations address fundamental challenges like codebook collapse, where traditional approaches utilize only small proportions of available codebook vectors.

## Future Directions
The next 2-5 years promise transformative developments across multiple dimensions. LLM integration will evolve toward universal recommendation foundation models that generalize across domains without fine-tuning. Current hybrid architectures combining memorization and generalization capabilities will mature into sophisticated systems balancing collaborative filtering insights with semantic understanding through advanced scaling laws and parameter-efficient techniques.

Multimodal and cross-modal semantic IDs represent a major opportunity. **Advanced multimodal architectures** will integrate Transformers for encoding multi-modal content in RQ-VAE frameworks. Cross-modal transfer learning will enable better semantic understanding across different content modalities. Dynamic modal weight assignment will adaptively adjust modality importance based on user preferences and content characteristics. 

Scalability innovations will address current bottlenecks. Parallel semantic ID[11] generation eliminates autoregressive constraints while maintaining semantic coherence. Mixture-of-Codes[12] approaches enable superior discriminability and dimension robustness for better scale-up performance. Real-time adaptive quantization[13] will dynamically adjust semantic representations based on evolving content and user behavior patterns.

New application domains extend far beyond traditional recommendations. Conversational AI integration through Retrieval Augmented Generation (RAG) enables real-time, contextual recommendations. AI-Generated Content (AIGC) systems use semantic IDs to generate personalized items rather than just retrieve existing ones. Professional applications include LinkedIn's networking recommendations, enterprise knowledge management, educational content systems, and healthcare recommendations with privacy-preserving techniques.


reference:

[1] [Better Generalization with Semantic IDs: A Case Study in Ranking for Recommendations](https://arxiv.org/html/2306.08121v2)

[2] [Recommender Systems with Generative Retrieval](https://openreview.net/forum?id=BJ0fQUU32w)

[3] [Enhancing Embedding Representation Stability in Recommendation Systems with Semantic ID](https://arxiv.org/abs/2504.02137)

[4] [Distributed Representations of Words and Phrases and their Compositionality](https://arxiv.org/abs/1310.4546)

[5] [Item2Vec: Neural Item Embedding for Collaborative Filtering](https://arxiv.org/abs/1603.04259)

[6] [Session-based Recommendations with Recurrent Neural Networks](https://arxiv.org/abs/1511.06939)

[7] [BERT4Rec: Sequential Recommendation with Bidirectional Encoder Representations from Transformer](https://arxiv.org/abs/1904.06690)

[8] [OneRec: Unifying Retrieve and Rank with Generative Recommender and Preference Alignment](https://arxiv.org/abs/2502.18965)

[9] [Sparse Meets Dense:Unified Generative Recommendations with Cascaded Sparse-Dense Representations](https://arxiv.org/abs/2503.02453)

[10] [FLIP: Fine-grained Alignment between ID-based Models and Pretrained Language Models for CTR Prediction](https://arxiv.org/abs/2310.19453)

[11] [Generating Long Semantic IDs in Parallel for Recommendation](https://arxiv.org/abs/2506.05781)

[12] [Towards Scalable Semantic Representation for Recommendation](https://arxiv.org/html/2410.09560v1)

[13] [LSAQ: Layer-Specific Adaptive Quantization for Large Language Model Deployment](https://arxiv.org/html/2412.18135v1)