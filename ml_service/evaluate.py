import pandas as pd
import numpy as np
import pickle
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.svm import SVC

print("Loading dataset...")
df = pd.read_csv("datasets/Training.csv")

# Handle any unnamed or extra columns
if 'Unnamed: 133' in df.columns:
    df = df.drop('Unnamed: 133', axis=1)

X = df.drop('prognosis', axis=1)
y = df['prognosis']

# Split for simple classification report
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Load existing SVC model
print("Loading model/svc.pkl...")
try:
    with open('model/svc.pkl', 'rb') as f:
        model = pickle.load(f)
except Exception as e:
    print("Failed to load svc.pkl:", e)
    print("Training a temporary SVC to get metrics...")
    model = SVC(probability=True)
    model.fit(X_train, y_train)

# Evaluate
print("Evaluating model...")
y_pred = model.predict(X_test)
acc = accuracy_score(y_test, y_pred)
print(f"\n--- Accuracy: {acc:.4f} ---")

print("\n--- Classification Report ---")
print(classification_report(y_test, y_pred))

# Cross validation on full dataset
print("Running 5-Fold Cross Validation...")
scores = cross_val_score(model, X, y, cv=5)
print(f"CV Score: {scores.mean():.4f} ± {scores.std():.4f}")
